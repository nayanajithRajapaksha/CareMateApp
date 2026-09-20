import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import pool from '../config/db';

export const getVaccines = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      `SELECT id, name, recommended_age_months, minimum_interval_days, created_at 
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
    const { name, recommended_age_months, minimum_interval_days } = req.body;

    if (!name || recommended_age_months === undefined) {
      res.status(400).json({ error: 'Name and recommended_age_months are required' });
      return;
    }

    const result = await pool.query(
      `INSERT INTO vaccines (name, recommended_age_months, minimum_interval_days) 
       VALUES ($1, $2, $3) 
       RETURNING *`,
      [name, recommended_age_months, minimum_interval_days || 0]
    );

    res.status(201).json({ message: 'Vaccine added successfully', vaccine: result.rows[0] });
  } catch (error) {
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
    const { name, recommended_age_months, minimum_interval_days } = req.body;

    if (!name || recommended_age_months === undefined) {
      res.status(400).json({ error: 'Name and recommended_age_months are required' });
      return;
    }

    const result = await pool.query(
      `UPDATE vaccines 
       SET name = $1, recommended_age_months = $2, minimum_interval_days = $3
       WHERE id = $4
       RETURNING *`,
      [name, recommended_age_months, minimum_interval_days || 0, id]
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
