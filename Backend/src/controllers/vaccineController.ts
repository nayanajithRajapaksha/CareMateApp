import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import pool from '../config/db';
import { sendEmailReminder } from '../services/notificationService';

export const getVaccines = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      `SELECT id, name, recommended_age_months, minimum_interval_days, dose_number, previous_dose_id, created_at 
       FROM vaccines 
       ORDER BY recommended_age_months ASC`
    );

    res.status(200).json({ vaccines: result.rows });
  } catch (error) {
    console.error('Error fetching vaccines:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const addVaccine = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, recommended_age_months, minimum_interval_days, dose_number, previous_dose_id, doses } = req.body;

    if (!name) {
      res.status(400).json({ error: 'Name is required' });
      return;
    }

    if (doses && Array.isArray(doses) && doses.length > 0) {
      await pool.query('BEGIN');
      let prevId = null;
      const createdVaccines = [];
      
      for (let i = 0; i < doses.length; i++) {
        const dose = doses[i];
        if (dose.recommended_age_months === undefined) {
          await pool.query('ROLLBACK');
          res.status(400).json({ error: `recommended_age_months is required for dose ${i + 1}` });
          return;
        }

        const result = await pool.query(
          `INSERT INTO vaccines (name, recommended_age_months, minimum_interval_days, dose_number, previous_dose_id) 
           VALUES ($1, $2, $3, $4, $5) 
           RETURNING *`,
          [name, dose.recommended_age_months, dose.minimum_interval_days || 0, dose.dose_number || (i + 1), prevId]
        );
        prevId = result.rows[0].id;
        createdVaccines.push(result.rows[0]);
      }
      
      await pool.query('COMMIT');
      res.status(201).json({ message: 'Vaccines added successfully', vaccines: createdVaccines });
      return;
    }

    // Fallback for single dose creation
    if (recommended_age_months === undefined) {
      res.status(400).json({ error: 'recommended_age_months is required' });
      return;
    }

    const result = await pool.query(
      `INSERT INTO vaccines (name, recommended_age_months, minimum_interval_days, dose_number, previous_dose_id) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [name, recommended_age_months, minimum_interval_days || 0, dose_number || 1, previous_dose_id || null]
    );

    res.status(201).json({ message: 'Vaccine added successfully', vaccine: result.rows[0] });
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Error adding vaccine:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getChildVaccinations = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params; // child_id

    // Fetch master schedule
    const vaccinesRes = await pool.query(`SELECT * FROM vaccines ORDER BY recommended_age_months ASC`);
    const vaccines = vaccinesRes.rows;

    // Fetch milestones (scheduled/upcoming)
    const milestonesRes = await pool.query(
      `SELECT * FROM vaccination_milestones WHERE child_id = $1`, 
      [id]
    );
    const milestones = milestonesRes.rows;

    // Fetch records (completed)
    const recordsRes = await pool.query(
      `SELECT * FROM vaccination_records WHERE child_id = $1`, 
      [id]
    );
    const records = recordsRes.rows;

    // Combine into a timeline
    const timeline = vaccines.map(vaccine => {
      const record = records.find(r => r.vaccine_id === vaccine.id);
      const milestone = milestones.find(m => m.vaccine_id === vaccine.id);
      
      return {
        ...vaccine,
        is_completed: !!record,
        administered_date: record ? record.administered_date : null,
        phm_id: record ? record.phm_id : null,
        batch_number: record ? record.batch_number : null,
        scheduled_date: milestone ? milestone.scheduled_date : null,
        status: record ? 'Completed' : (milestone ? milestone.status : 'Upcoming'),
        milestone_id: milestone ? milestone.id : null,
        record_id: record ? record.id : null
      };
    });

    res.status(200).json({ timeline });
  } catch (error) {
    console.error('Error fetching child vaccinations:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const markVaccineAdministered = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const phmId = req.user?.id;
    const { id } = req.params; // child_id
    const { vaccine_id, batch_number, administered_date } = req.body;

    if (!phmId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    if (!vaccine_id) {
      res.status(400).json({ error: 'vaccine_id is required' });
      return;
    }

    const adminDate = administered_date || new Date().toISOString();

    await pool.query('BEGIN');

    // 1. Insert into vaccination_records
    const result = await pool.query(
      `INSERT INTO vaccination_records (child_id, vaccine_id, phm_id, administered_date, batch_number) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [id, vaccine_id, phmId, adminDate, batch_number]
    );

    // 2. Update milestones to 'Completed' if exists
    await pool.query(
      `UPDATE vaccination_milestones SET status = 'Completed' WHERE child_id = $1 AND vaccine_id = $2`,
      [id, vaccine_id]
    );

    await pool.query('COMMIT');

    res.status(200).json({ message: 'Vaccine marked as administered', record: result.rows[0] });
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Error marking vaccine as administered:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateVaccine = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, recommended_age_months, minimum_interval_days, dose_number, previous_dose_id } = req.body;

    if (!name || recommended_age_months === undefined) {
      res.status(400).json({ error: 'Name and recommended_age_months are required' });
      return;
    }

    const result = await pool.query(
      `UPDATE vaccines 
       SET name = $1, recommended_age_months = $2, minimum_interval_days = $3, dose_number = $4, previous_dose_id = $5
       WHERE id = $6
       RETURNING *`,
      [name, recommended_age_months, minimum_interval_days || 0, dose_number || 1, previous_dose_id || null, id]
    );

    if (result.rowCount === 0) {
      res.status(404).json({ error: 'Vaccine not found' });
      return;
    }

    res.status(200).json({ message: 'Vaccine updated successfully', vaccine: result.rows[0] });
  } catch (error) {
    console.error('Error updating vaccine:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const removeVaccineRecord = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id, record_id } = req.params; // child_id, record_id

    await pool.query('BEGIN');

    // Fetch the record to know which vaccine it was
    const recordRes = await pool.query(`SELECT vaccine_id FROM vaccination_records WHERE id = $1 AND child_id = $2`, [record_id, id]);
    
    if (recordRes.rowCount === 0) {
      await pool.query('ROLLBACK');
      res.status(404).json({ error: 'Vaccination record not found' });
      return;
    }

    const vaccineId = recordRes.rows[0].vaccine_id;

    // Delete the record
    await pool.query(`DELETE FROM vaccination_records WHERE id = $1`, [record_id]);

    // Revert the milestone back to 'Upcoming'
    await pool.query(
      `UPDATE vaccination_milestones SET status = 'Upcoming' WHERE child_id = $1 AND vaccine_id = $2`,
      [id, vaccineId]
    );

    await pool.query('COMMIT');

    res.status(200).json({ message: 'Vaccination record removed successfully' });
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Error removing vaccine record:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const sendOverdueWarning = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params; // child_id
    const { vaccine_id } = req.body;

    if (!vaccine_id) {
      res.status(400).json({ error: 'vaccine_id is required' });
      return;
    }

    // Fetch child and parent info
    const childRes = await pool.query(
      `SELECT c.full_name as child_name, u.email as parent_email, p.full_name as parent_name
       FROM children c
       JOIN app_users u ON c.parent_id = u.id
       LEFT JOIN profiles p ON u.id = p.id
       WHERE c.id = $1`,
      [id]
    );

    if (childRes.rowCount === 0) {
      res.status(404).json({ error: 'Child not found' });
      return;
    }

    const { child_name, parent_email, parent_name } = childRes.rows[0];

    // Fetch vaccine info
    const vaccineRes = await pool.query(`SELECT name FROM vaccines WHERE id = $1`, [vaccine_id]);
    
    if (vaccineRes.rowCount === 0) {
      res.status(404).json({ error: 'Vaccine not found' });
      return;
    }

    const vaccineName = vaccineRes.rows[0].name;

    // Send email
    if (parent_email) {
      const subject = `Urgent: Overdue Vaccination for ${child_name}`;
      const html = `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #DC4C4C;">Vaccination Overdue Warning</h2>
          <p>Dear ${parent_name || 'Parent'},</p>
          <p>This is an important notification regarding your child, <strong>${child_name}</strong>.</p>
          <p>The <strong>${vaccineName}</strong> vaccination is currently overdue. Please contact your family clinic or PHM midwife as soon as possible to schedule this vaccination.</p>
          <br/>
          <p>Thank you,<br/>CareMate Health Team</p>
        </div>
      `;
      
      const success = await sendEmailReminder(parent_email, subject, html);
      if (success) {
        res.status(200).json({ message: 'Warning notification sent to parent successfully.' });
      } else {
        res.status(500).json({ error: 'Failed to send warning email. Please check email service configuration.' });
      }
    } else {
      res.status(400).json({ error: 'Parent does not have an email address configured.' });
    }
  } catch (error) {
    console.error('Error sending overdue warning:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
