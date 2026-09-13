import { Response } from 'express';
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
  if (req.user?.role?.toLowerCase() !== 'moh') {
    res.status(403).json({ error: 'Forbidden. Only MOH can assign hospitals.' });
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
