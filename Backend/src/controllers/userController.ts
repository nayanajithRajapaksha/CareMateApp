import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import pool from '../config/db';

export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const result = await pool.query(
      `SELECT u.email, p.full_name, p.contact_number, p.role, p.hospital, p.avatar_url
       FROM app_users u
       JOIN profiles p ON u.id = p.id
       WHERE u.id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'User profile not found' });
      return;
    }

    res.status(200).json({ profile: result.rows[0] });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { full_name, contact_number, avatar_url } = req.body;

    if (!full_name && !avatar_url && contact_number === undefined) {
      res.status(400).json({ error: 'At least one field to update is required' });
      return;
    }

    const result = await pool.query(
      `UPDATE profiles
       SET full_name = COALESCE($1, full_name),
           contact_number = COALESCE($2, contact_number),
           avatar_url = COALESCE($3, avatar_url)
       WHERE id = $4
       RETURNING full_name, contact_number, role, hospital, avatar_url`,
      [full_name || null, contact_number ?? null, avatar_url || null, userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'User profile not found' });
      return;
    }

    res.status(200).json({ message: 'Profile updated successfully', profile: result.rows[0] });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAllUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      `SELECT p.id, u.email, p.full_name, p.contact_number, p.role, p.hospital, p.avatar_url, p.created_at
       FROM profiles p
       JOIN app_users u ON p.id = u.id
       ORDER BY p.created_at DESC`
    );

    res.status(200).json({ users: result.rows });
  } catch (error) {
    console.error('Error fetching all users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


