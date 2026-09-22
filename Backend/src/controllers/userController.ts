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
      `SELECT u.email, p.full_name, p.contact_number, p.role, p.hospital, p.email_notifications, p.push_notifications, p.profile_pic_url
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

    const { full_name, contact_number, email_notifications, push_notifications } = req.body;

    if (!full_name) {
      res.status(400).json({ error: 'Full name is required' });
      return;
    }

    const result = await pool.query(
      `UPDATE profiles
       SET full_name = $1,
           contact_number = COALESCE($2, contact_number),
           email_notifications = COALESCE($3, email_notifications),
           push_notifications = COALESCE($4, push_notifications)
       WHERE id = $5
       RETURNING full_name, contact_number, role, hospital, email_notifications, push_notifications, profile_pic_url`,
      [full_name, contact_number ?? null, email_notifications ?? null, push_notifications ?? null, userId]
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
      `SELECT p.id, u.email, p.full_name, p.contact_number, p.role, p.hospital, p.created_at, p.profile_pic_url
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

export const updatePushToken = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { expo_push_token } = req.body;
    if (!expo_push_token) {
      res.status(400).json({ error: 'expo_push_token is required' });
      return;
    }

    await pool.query(
      `UPDATE profiles SET expo_push_token = $1 WHERE id = $2`,
      [expo_push_token, userId]
    );

    res.status(200).json({ message: 'Push token updated successfully' });
  } catch (error) {
    console.error('Error updating push token:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getUserNotifications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const result = await pool.query(
      `SELECT id, title, message, type, is_read, created_at 
       FROM app_notifications 
       WHERE user_id = $1 
       ORDER BY created_at DESC`,
      [userId]
    );

    res.status(200).json({ notifications: result.rows });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const markNotificationAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    await pool.query(
      `UPDATE app_notifications SET is_read = true WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );

    res.status(200).json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
