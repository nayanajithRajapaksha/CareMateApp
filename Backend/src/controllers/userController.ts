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
      `SELECT u.email, p.full_name, p.contact_number, p.role, p.hospital
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

    const { full_name, contact_number } = req.body;

    if (!full_name) {
      res.status(400).json({ error: 'Full name is required' });
      return;
    }

    const result = await pool.query(
      `UPDATE profiles
       SET full_name = $1,
           contact_number = COALESCE($2, contact_number)
       WHERE id = $3
       RETURNING full_name, contact_number, role, hospital`,
      [full_name, contact_number ?? null, userId]
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
