"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteClinic = exports.updateClinic = exports.createClinic = exports.getAllClinics = void 0;
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
//# sourceMappingURL=clinicController.js.map