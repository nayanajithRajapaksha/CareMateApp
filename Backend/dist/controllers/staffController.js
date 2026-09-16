"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.assignParentHospital = exports.getParents = exports.createPHMByMOH = exports.unassignHospital = exports.assignHospital = exports.getAssignedPHMs = exports.getUnassignedPHMs = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const db_1 = __importDefault(require("../config/db"));
const getUnassignedPHMs = async (req, res) => {
    if (req.user?.role?.toLowerCase() !== 'moh') {
        res.status(403).json({ error: 'Forbidden. Only MOH can view unassigned PHMs.' });
        return;
    }
    try {
        const result = await db_1.default.query(`SELECT p.id as profile_id, a.email, p.full_name, p.contact_number, p.created_at
       FROM profiles p
       JOIN app_users a ON p.id = a.id
       WHERE p.role = 'phm' AND (p.hospital IS NULL OR p.hospital = '')
       ORDER BY p.created_at DESC`);
        res.status(200).json({ phms: result.rows });
    }
    catch (error) {
        console.error('Error fetching unassigned PHMs:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getUnassignedPHMs = getUnassignedPHMs;
const getAssignedPHMs = async (req, res) => {
    if (req.user?.role?.toLowerCase() !== 'moh') {
        res.status(403).json({ error: 'Forbidden. Only MOH can view assigned PHMs.' });
        return;
    }
    try {
        const result = await db_1.default.query(`SELECT p.id as profile_id, a.email, p.full_name, p.contact_number, p.hospital, p.created_at
       FROM profiles p
       JOIN app_users a ON p.id = a.id
       WHERE p.role = 'phm' AND p.hospital IS NOT NULL AND p.hospital != ''
       ORDER BY p.created_at DESC`);
        res.status(200).json({ phms: result.rows });
    }
    catch (error) {
        console.error('Error fetching assigned PHMs:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getAssignedPHMs = getAssignedPHMs;
const assignHospital = async (req, res) => {
    const userRole = req.user?.role?.toLowerCase();
    if (userRole !== 'moh') {
        res.status(403).json({ error: 'Forbidden. Only MOH can update hospital assignments.' });
        return;
    }
    const { profile_id, hospital } = req.body;
    if (!profile_id || !hospital) {
        res.status(400).json({ error: 'profile_id and hospital are required.' });
        return;
    }
    try {
        const profile = await db_1.default.query('SELECT hospital FROM profiles WHERE id = $1 AND role = \'phm\'', [profile_id]);
        if (profile.rows.length === 0) {
            res.status(404).json({ error: 'PHM not found or user is not a PHM.' });
            return;
        }
        let hospitals = profile.rows[0].hospital ? profile.rows[0].hospital.split(',').map((h) => h.trim()) : [];
        if (!hospitals.includes(hospital)) {
            hospitals.push(hospital);
        }
        const newHospitalString = hospitals.join(', ');
        const result = await db_1.default.query(`UPDATE profiles SET hospital = $1 WHERE id = $2 AND role = 'phm' RETURNING *`, [newHospitalString, profile_id]);
        // Handle result in the catch block if needed, but we already validated the profile
        res.status(200).json({ message: 'Hospital assigned successfully', profile: result.rows[0] });
    }
    catch (error) {
        console.error('Error assigning hospital:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.assignHospital = assignHospital;
const unassignHospital = async (req, res) => {
    if (req.user?.role?.toLowerCase() !== 'moh') {
        res.status(403).json({ error: 'Forbidden. Only MOH can unassign hospitals.' });
        return;
    }
    const { profile_id, hospital } = req.body;
    if (!profile_id) {
        res.status(400).json({ error: 'profile_id is required.' });
        return;
    }
    try {
        const profile = await db_1.default.query('SELECT hospital FROM profiles WHERE id = $1 AND role = \'phm\'', [profile_id]);
        if (profile.rows.length === 0) {
            res.status(404).json({ error: 'PHM not found or user is not a PHM.' });
            return;
        }
        let newHospitalString = null;
        if (hospital && profile.rows[0].hospital) {
            const hospitals = profile.rows[0].hospital.split(',').map((h) => h.trim()).filter((h) => h !== hospital);
            newHospitalString = hospitals.length > 0 ? hospitals.join(', ') : null;
        }
        const result = await db_1.default.query(`UPDATE profiles SET hospital = $1 WHERE id = $2 AND role = 'phm' RETURNING *`, [newHospitalString, profile_id]);
        // Already checked
        res.status(200).json({ message: 'Hospital removed successfully', profile: result.rows[0] });
    }
    catch (error) {
        console.error('Error removing hospital assignment:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.unassignHospital = unassignHospital;
const createPHMByMOH = async (req, res) => {
    if (req.user?.role?.toLowerCase() !== 'moh') {
        res.status(403).json({ error: 'Forbidden. Only MOH Supervisors can create PHMs.' });
        return;
    }
    const { email, password, full_name, contact_number, hospital } = req.body;
    if (!email || !password || !full_name) {
        res.status(400).json({ error: 'Email, password, and full name are required.' });
        return;
    }
    const cleanEmail = email.toLowerCase().trim();
    const client = await db_1.default.connect();
    try {
        await client.query('BEGIN');
        const userCheck = await client.query('SELECT id FROM app_users WHERE email = $1', [cleanEmail]);
        if (userCheck.rows.length > 0) {
            res.status(400).json({ error: 'User with this email already exists.' });
            return;
        }
        const passwordHash = await bcrypt_1.default.hash(password, 10);
        const userResult = await client.query('INSERT INTO app_users (email, password_hash) VALUES ($1, $2) RETURNING id', [cleanEmail, passwordHash]);
        const userId = userResult.rows[0].id;
        await client.query("INSERT INTO profiles (id, role, full_name, contact_number, hospital) VALUES ($1, 'phm', $2, $3, $4)", [userId, full_name, contact_number || null, hospital || null]);
        await client.query('COMMIT');
        res.status(201).json({ message: 'Midwife registered successfully', user: { id: userId, email: cleanEmail, full_name, hospital } });
    }
    catch (error) {
        await client.query('ROLLBACK');
        console.error('Error creating PHM by MOH:', error);
        res.status(500).json({ error: 'Internal server error during PHM creation.' });
    }
    finally {
        client.release();
    }
};
exports.createPHMByMOH = createPHMByMOH;
const getParents = async (req, res) => {
    const userRole = req.user?.role?.toLowerCase();
    if (userRole !== 'moh' && userRole !== 'phm' && userRole !== 'midwife') {
        res.status(403).json({ error: 'Forbidden. Only MOH or Midwives can view parents list.' });
        return;
    }
    try {
        const result = await db_1.default.query(`SELECT p.id as profile_id, a.email, p.full_name, p.contact_number, p.created_at,
              COUNT(c.id)::int as children_count,
              COALESCE(json_agg(json_build_object('id', c.id, 'name', c.full_name, 'dob', c.dob)) FILTER (WHERE c.id IS NOT NULL), '[]'::json) as children_list
       FROM profiles p
       JOIN app_users a ON p.id = a.id
       LEFT JOIN children c ON p.id = c.parent_id
       WHERE p.role = 'parent'
       GROUP BY p.id, a.email, p.full_name, p.contact_number, p.created_at
       ORDER BY p.created_at DESC`);
        res.status(200).json({ parents: result.rows });
    }
    catch (error) {
        console.error('Error fetching parents:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getParents = getParents;
const assignParentHospital = async (req, res) => {
    const userRole = req.user?.role?.toLowerCase();
    if (userRole !== 'moh' && userRole !== 'phm' && userRole !== 'midwife') {
        res.status(403).json({ error: 'Forbidden. Only MOH or Midwives can assign parents to clinics/hospitals.' });
        return;
    }
    const { profile_id, hospital: requestedHospital } = req.body;
    let hospital = requestedHospital;
    if (userRole === 'phm' || userRole === 'midwife') {
        const staffProfile = await db_1.default.query('SELECT hospital FROM profiles WHERE id = $1 AND role = \'phm\'', [req.user?.id]);
        hospital = staffProfile.rows[0]?.hospital;
    }
    if (!profile_id) {
        res.status(400).json({ error: 'profile_id is required.' });
        return;
    }
    if (!hospital) {
        res.status(400).json({ error: 'Your midwife account has no assigned hospital.' });
        return;
    }
    try {
        const result = await db_1.default.query(`UPDATE profiles SET hospital = $1 WHERE id = $2 AND role = 'parent' RETURNING *`, [hospital, profile_id]);
        if (result.rows.length === 0) {
            res.status(404).json({ error: 'Parent profile not found.' });
            return;
        }
        res.status(200).json({ message: 'Parent clinic/hospital assigned successfully', profile: result.rows[0] });
    }
    catch (error) {
        console.error('Error assigning parent hospital:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.assignParentHospital = assignParentHospital;
//# sourceMappingURL=staffController.js.map