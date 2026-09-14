import { Response } from 'express';
import bcrypt from 'bcrypt';
import pool from '../config/db';
import { AuthRequest } from '../middleware/authMiddleware';

export const getUnassignedPHMs = async (req: AuthRequest, res: Response): Promise<void> => {
  if (req.user?.role?.toLowerCase() !== 'moh') {
    res.status(403).json({ error: 'Forbidden. Only MOH can view unassigned PHMs.' });
    return;
  }

  try {
    const result = await pool.query(
      `SELECT p.id as profile_id, a.email, p.full_name, p.contact_number, p.created_at
       FROM profiles p
       JOIN app_users a ON p.id = a.id
       WHERE p.role = 'phm' AND (p.hospital IS NULL OR p.hospital = '')
       ORDER BY p.created_at DESC`
    );
    res.status(200).json({ phms: result.rows });
  } catch (error) {
    console.error('Error fetching unassigned PHMs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAssignedPHMs = async (req: AuthRequest, res: Response): Promise<void> => {
  if (req.user?.role?.toLowerCase() !== 'moh') {
    res.status(403).json({ error: 'Forbidden. Only MOH can view assigned PHMs.' });
    return;
  }

  try {
    const result = await pool.query(
      `SELECT p.id as profile_id, a.email, p.full_name, p.contact_number, p.hospital, p.created_at
       FROM profiles p
       JOIN app_users a ON p.id = a.id
       WHERE p.role = 'phm' AND p.hospital IS NOT NULL AND p.hospital != ''
       ORDER BY p.created_at DESC`
    );
    res.status(200).json({ phms: result.rows });
  } catch (error) {
    console.error('Error fetching assigned PHMs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const assignHospital = async (req: AuthRequest, res: Response): Promise<void> => {
  const userRole = req.user?.role?.toLowerCase();
  if (userRole !== 'moh' && userRole !== 'phm' && userRole !== 'midwife') {
    res.status(403).json({ error: 'Forbidden. Only MOH or Midwives can update hospital assignments.' });
    return;
  }

  const { profile_id, hospital } = req.body;

  if (!profile_id || !hospital) {
    res.status(400).json({ error: 'profile_id and hospital are required.' });
    return;
  }

  try {
    const result = await pool.query(
      `UPDATE profiles SET hospital = $1 WHERE id = $2 AND role = 'phm' RETURNING *`,
      [hospital, profile_id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'PHM not found or user is not a PHM.' });
      return;
    }

    res.status(200).json({ message: 'Hospital assigned successfully', profile: result.rows[0] });
  } catch (error) {
    console.error('Error assigning hospital:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const unassignHospital = async (req: AuthRequest, res: Response): Promise<void> => {
  if (req.user?.role?.toLowerCase() !== 'moh') {
    res.status(403).json({ error: 'Forbidden. Only MOH can unassign hospitals.' });
    return;
  }

  const { profile_id } = req.body;

  if (!profile_id) {
    res.status(400).json({ error: 'profile_id is required.' });
    return;
  }

  try {
    const result = await pool.query(
      `UPDATE profiles SET hospital = NULL WHERE id = $1 AND role = 'phm' RETURNING *`,
      [profile_id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'PHM not found or user is not a PHM.' });
      return;
    }

    res.status(200).json({ message: 'Hospital removed successfully', profile: result.rows[0] });
  } catch (error) {
    console.error('Error removing hospital assignment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createPHMByMOH = async (req: AuthRequest, res: Response): Promise<void> => {
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
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const userCheck = await client.query('SELECT id FROM app_users WHERE email = $1', [cleanEmail]);
    if (userCheck.rows.length > 0) {
      res.status(400).json({ error: 'User with this email already exists.' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userResult = await client.query(
      'INSERT INTO app_users (email, password_hash) VALUES ($1, $2) RETURNING id',
      [cleanEmail, passwordHash]
    );
    const userId = userResult.rows[0].id;

    await client.query(
      "INSERT INTO profiles (id, role, full_name, contact_number, hospital) VALUES ($1, 'phm', $2, $3, $4)",
      [userId, full_name, contact_number || null, hospital || null]
    );

    await client.query('COMMIT');
    res.status(201).json({ message: 'Midwife registered successfully', user: { id: userId, email: cleanEmail, full_name, hospital } });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating PHM by MOH:', error);
    res.status(500).json({ error: 'Internal server error during PHM creation.' });
  } finally {
    client.release();
  }
};

export const getParents = async (req: AuthRequest, res: Response): Promise<void> => {
  const userRole = req.user?.role?.toLowerCase();
  if (userRole !== 'moh' && userRole !== 'phm' && userRole !== 'midwife') {
    res.status(403).json({ error: 'Forbidden. Only MOH or Midwives can view parents list.' });
    return;
  }

  try {
    const result = await pool.query(
      `SELECT p.id as profile_id, a.email, p.full_name, p.contact_number, p.hospital, p.created_at,
              COUNT(c.id)::int as children_count
       FROM profiles p
       JOIN app_users a ON p.id = a.id
       LEFT JOIN children c ON p.id = c.parent_id
       WHERE p.role = 'parent'
       GROUP BY p.id, a.email, p.full_name, p.contact_number, p.hospital, p.created_at
       ORDER BY p.created_at DESC`
    );
    res.status(200).json({ parents: result.rows });
  } catch (error) {
    console.error('Error fetching parents:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const assignParentHospital = async (req: AuthRequest, res: Response): Promise<void> => {
  const userRole = req.user?.role?.toLowerCase();
  if (userRole !== 'moh' && userRole !== 'phm' && userRole !== 'midwife') {
    res.status(403).json({ error: 'Forbidden. Only MOH or Midwives can assign parents to clinics/hospitals.' });
    return;
  }

  const { profile_id, hospital } = req.body;

  if (!profile_id || !hospital) {
    res.status(400).json({ error: 'profile_id and hospital are required.' });
    return;
  }

  try {
    const result = await pool.query(
      `UPDATE profiles SET hospital = $1 WHERE id = $2 AND role = 'parent' RETURNING *`,
      [hospital, profile_id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Parent profile not found.' });
      return;
    }

    res.status(200).json({ message: 'Parent clinic/hospital assigned successfully', profile: result.rows[0] });
  } catch (error) {
    console.error('Error assigning parent hospital:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


