"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendOverdueWarning = exports.removeVaccineRecord = exports.updateVaccine = exports.markVaccineAdministered = exports.getChildVaccinations = exports.addVaccine = exports.getVaccines = void 0;
const db_1 = __importDefault(require("../config/db"));
const notificationService_1 = require("../services/notificationService");
const getVaccines = async (req, res) => {
    try {
        const result = await db_1.default.query(`SELECT id, name, recommended_age_months, minimum_interval_days, created_at 
       FROM vaccines 
       ORDER BY recommended_age_months ASC`);
        res.status(200).json({ vaccines: result.rows });
    }
    catch (error) {
        console.error('Error fetching vaccines:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getVaccines = getVaccines;
const addVaccine = async (req, res) => {
    try {
        const { name, recommended_age_months, minimum_interval_days } = req.body;
        if (!name || recommended_age_months === undefined) {
            res.status(400).json({ error: 'Name and recommended_age_months are required' });
            return;
        }
        const result = await db_1.default.query(`INSERT INTO vaccines (name, recommended_age_months, minimum_interval_days) 
       VALUES ($1, $2, $3) 
       RETURNING *`, [name, recommended_age_months, minimum_interval_days || 0]);
        res.status(201).json({ message: 'Vaccine added successfully', vaccine: result.rows[0] });
    }
    catch (error) {
        console.error('Error adding vaccine:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.addVaccine = addVaccine;
const getChildVaccinations = async (req, res) => {
    try {
        const { id } = req.params; // child_id
        // Fetch master schedule
        const vaccinesRes = await db_1.default.query(`SELECT * FROM vaccines ORDER BY recommended_age_months ASC`);
        const vaccines = vaccinesRes.rows;
        // Fetch milestones (scheduled/upcoming)
        const milestonesRes = await db_1.default.query(`SELECT * FROM vaccination_milestones WHERE child_id = $1`, [id]);
        const milestones = milestonesRes.rows;
        // Fetch records (completed)
        const recordsRes = await db_1.default.query(`SELECT * FROM vaccination_records WHERE child_id = $1`, [id]);
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
    }
    catch (error) {
        console.error('Error fetching child vaccinations:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getChildVaccinations = getChildVaccinations;
const markVaccineAdministered = async (req, res) => {
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
        await db_1.default.query('BEGIN');
        // 1. Insert into vaccination_records
        const result = await db_1.default.query(`INSERT INTO vaccination_records (child_id, vaccine_id, phm_id, administered_date, batch_number) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`, [id, vaccine_id, phmId, adminDate, batch_number]);
        // 2. Update milestones to 'Completed' if exists
        await db_1.default.query(`UPDATE vaccination_milestones SET status = 'Completed' WHERE child_id = $1 AND vaccine_id = $2`, [id, vaccine_id]);
        await db_1.default.query('COMMIT');
        res.status(200).json({ message: 'Vaccine marked as administered', record: result.rows[0] });
    }
    catch (error) {
        await db_1.default.query('ROLLBACK');
        console.error('Error marking vaccine as administered:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.markVaccineAdministered = markVaccineAdministered;
const updateVaccine = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, recommended_age_months, minimum_interval_days } = req.body;
        if (!name || recommended_age_months === undefined) {
            res.status(400).json({ error: 'Name and recommended_age_months are required' });
            return;
        }
        const result = await db_1.default.query(`UPDATE vaccines 
       SET name = $1, recommended_age_months = $2, minimum_interval_days = $3
       WHERE id = $4
       RETURNING *`, [name, recommended_age_months, minimum_interval_days || 0, id]);
        if (result.rowCount === 0) {
            res.status(404).json({ error: 'Vaccine not found' });
            return;
        }
        res.status(200).json({ message: 'Vaccine updated successfully', vaccine: result.rows[0] });
    }
    catch (error) {
        console.error('Error updating vaccine:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.updateVaccine = updateVaccine;
const removeVaccineRecord = async (req, res) => {
    try {
        const { id, record_id } = req.params; // child_id, record_id
        await db_1.default.query('BEGIN');
        // Fetch the record to know which vaccine it was
        const recordRes = await db_1.default.query(`SELECT vaccine_id FROM vaccination_records WHERE id = $1 AND child_id = $2`, [record_id, id]);
        if (recordRes.rowCount === 0) {
            await db_1.default.query('ROLLBACK');
            res.status(404).json({ error: 'Vaccination record not found' });
            return;
        }
        const vaccineId = recordRes.rows[0].vaccine_id;
        // Delete the record
        await db_1.default.query(`DELETE FROM vaccination_records WHERE id = $1`, [record_id]);
        // Revert the milestone back to 'Upcoming'
        await db_1.default.query(`UPDATE vaccination_milestones SET status = 'Upcoming' WHERE child_id = $1 AND vaccine_id = $2`, [id, vaccineId]);
        await db_1.default.query('COMMIT');
        res.status(200).json({ message: 'Vaccination record removed successfully' });
    }
    catch (error) {
        await db_1.default.query('ROLLBACK');
        console.error('Error removing vaccine record:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.removeVaccineRecord = removeVaccineRecord;
const sendOverdueWarning = async (req, res) => {
    try {
        const { id } = req.params; // child_id
        const { vaccine_id } = req.body;
        if (!vaccine_id) {
            res.status(400).json({ error: 'vaccine_id is required' });
            return;
        }
        // Fetch child and parent info
        const childRes = await db_1.default.query(`SELECT c.full_name as child_name, u.email as parent_email, p.full_name as parent_name
       FROM children c
       JOIN users u ON c.parent_id = u.id
       LEFT JOIN profiles p ON u.id = p.id
       WHERE c.id = $1`, [id]);
        if (childRes.rowCount === 0) {
            res.status(404).json({ error: 'Child not found' });
            return;
        }
        const { child_name, parent_email, parent_name } = childRes.rows[0];
        // Fetch vaccine info
        const vaccineRes = await db_1.default.query(`SELECT name FROM vaccines WHERE id = $1`, [vaccine_id]);
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
            const success = await (0, notificationService_1.sendEmailReminder)(parent_email, subject, html);
            if (success) {
                res.status(200).json({ message: 'Warning notification sent to parent successfully.' });
            }
            else {
                res.status(500).json({ error: 'Failed to send warning email. Please check email service configuration.' });
            }
        }
        else {
            res.status(400).json({ error: 'Parent does not have an email address configured.' });
        }
    }
    catch (error) {
        console.error('Error sending overdue warning:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.sendOverdueWarning = sendOverdueWarning;
//# sourceMappingURL=vaccineController.js.map