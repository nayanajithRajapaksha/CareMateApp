"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSpecialist = exports.updateSpecialist = exports.createSpecialist = exports.getSpecialists = exports.deleteClinic = exports.updateClinic = exports.createClinic = exports.getAllClinics = void 0;
const db_1 = __importDefault(require("../config/db"));
// GET /api/clinics — public (mobile app + web)
const getAllClinics = async (_req, res) => {
    try {
        const result = await db_1.default.query(`SELECT id, name, address, type, lat, lng, is_open AS open, phone, hours, created_at, updated_at
       FROM clinics ORDER BY name ASC`);
        res.status(200).json({ clinics: result.rows });
    }
    catch (error) {
        console.error('Error fetching clinics:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getAllClinics = getAllClinics;
// POST /api/clinics — MOH supervisor only
const createClinic = async (req, res) => {
    const { name, address, type, lat, lng, open, phone, hours } = req.body;
    if (!name || !address || !type || lat == null || lng == null) {
        res.status(400).json({ error: 'name, address, type, lat, and lng are required.' });
        return;
    }
    try {
        const result = await db_1.default.query(`INSERT INTO clinics (name, address, type, lat, lng, is_open, phone, hours, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id, name, address, type, lat, lng, is_open AS open, phone, hours, created_at, updated_at`, [name, address, type, lat, lng, open ?? true, phone ?? null, hours ?? null, req.user?.id ?? null]);
        res.status(201).json({ clinic: result.rows[0] });
    }
    catch (error) {
        console.error('Error creating clinic:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.createClinic = createClinic;
// PUT /api/clinics/:id — MOH supervisor only
const updateClinic = async (req, res) => {
    const { id } = req.params;
    const { name, address, type, lat, lng, open, phone, hours } = req.body;
    if (!name || !address || !type || lat == null || lng == null) {
        res.status(400).json({ error: 'name, address, type, lat, and lng are required.' });
        return;
    }
    try {
        const result = await db_1.default.query(`UPDATE clinics
       SET name=$1, address=$2, type=$3, lat=$4, lng=$5, is_open=$6, phone=$7, hours=$8, updated_at=NOW()
       WHERE id=$9
       RETURNING id, name, address, type, lat, lng, is_open AS open, phone, hours, created_at, updated_at`, [name, address, type, lat, lng, open ?? true, phone ?? null, hours ?? null, id]);
        if (result.rows.length === 0) {
            res.status(404).json({ error: 'Clinic not found.' });
            return;
        }
        res.status(200).json({ clinic: result.rows[0] });
    }
    catch (error) {
        console.error('Error updating clinic:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.updateClinic = updateClinic;
// DELETE /api/clinics/:id — MOH supervisor only
const deleteClinic = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db_1.default.query('DELETE FROM clinics WHERE id=$1 RETURNING id', [id]);
        if (result.rows.length === 0) {
            res.status(404).json({ error: 'Clinic not found.' });
            return;
        }
        res.status(200).json({ message: 'Clinic deleted successfully.' });
    }
    catch (error) {
        console.error('Error deleting clinic:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.deleteClinic = deleteClinic;
// GET /api/clinics/:id/specialists — public (mobile app)
const getSpecialists = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db_1.default.query(`SELECT id, clinic_id, full_name, specialty, contact_number, availability, created_at
       FROM clinic_specialists
       WHERE clinic_id = $1
       ORDER BY created_at DESC`, [id]);
        res.status(200).json({ specialists: result.rows });
    }
    catch (error) {
        console.error('Error fetching specialists:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getSpecialists = getSpecialists;
// POST /api/clinics/:id/specialists — MOH supervisor only
const createSpecialist = async (req, res) => {
    const { id } = req.params;
    const { full_name, specialty, contact_number, availability } = req.body;
    if (!full_name || !specialty) {
        res.status(400).json({ error: 'full_name and specialty are required.' });
        return;
    }
    try {
        const result = await db_1.default.query(`INSERT INTO clinic_specialists (clinic_id, full_name, specialty, contact_number, availability)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, clinic_id, full_name, specialty, contact_number, availability, created_at`, [id, full_name, specialty, contact_number ?? null, availability ?? null]);
        res.status(201).json({ specialist: result.rows[0] });
    }
    catch (error) {
        console.error('Error creating specialist:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.createSpecialist = createSpecialist;
// PUT /api/clinics/:id/specialists/:specialistId — MOH supervisor only
const updateSpecialist = async (req, res) => {
    const { id, specialistId } = req.params;
    const { full_name, specialty, contact_number, availability } = req.body;
    if (!full_name || !specialty) {
        res.status(400).json({ error: 'full_name and specialty are required.' });
        return;
    }
    try {
        const result = await db_1.default.query(`UPDATE clinic_specialists 
       SET full_name = $1, specialty = $2, contact_number = $3, availability = $4
       WHERE id = $5 AND clinic_id = $6
       RETURNING id, clinic_id, full_name, specialty, contact_number, availability, created_at`, [full_name, specialty, contact_number ?? null, availability ?? null, specialistId, id]);
        if (result.rows.length === 0) {
            res.status(404).json({ error: 'Specialist not found' });
            return;
        }
        res.json({ specialist: result.rows[0] });
    }
    catch (error) {
        console.error('Error updating specialist:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.updateSpecialist = updateSpecialist;
// DELETE /api/clinics/:id/specialists/:specialistId — MOH supervisor only
const deleteSpecialist = async (req, res) => {
    const { id, specialistId } = req.params;
    try {
        const result = await db_1.default.query(`DELETE FROM clinic_specialists WHERE id = $1 AND clinic_id = $2 RETURNING id`, [specialistId, id]);
        if (result.rows.length === 0) {
            res.status(404).json({ error: 'Specialist not found' });
            return;
        }
        res.status(204).send();
    }
    catch (error) {
        console.error('Error deleting specialist:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.deleteSpecialist = deleteSpecialist;
//# sourceMappingURL=clinicController.js.map