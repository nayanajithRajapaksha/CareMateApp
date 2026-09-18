import { Response } from 'express';
import pool from '../config/db';
import { AuthRequest } from '../middleware/authMiddleware';
import { runReminders, runAllFutureReminders } from '../jobs/reminderCron';

export const getNotificationSettings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await pool.query('SELECT id, days_before FROM notification_settings ORDER BY days_before ASC');
    res.status(200).json({ settings: result.rows });
  } catch (error) {
    console.error('Error fetching notification settings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateNotificationSettings = async (req: AuthRequest, res: Response): Promise<void> => {
  const { days } = req.body;
  if (!Array.isArray(days)) {
    res.status(400).json({ error: 'Expected an array of days (numbers).' });
    return;
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('TRUNCATE TABLE notification_settings');
    
    for (const day of days) {
      if (typeof day === 'number' && day > 0) {
        await client.query('INSERT INTO notification_settings (days_before) VALUES ($1) ON CONFLICT DO NOTHING', [day]);
      }
    }
    
    await client.query('COMMIT');
    
    const result = await client.query('SELECT id, days_before FROM notification_settings ORDER BY days_before ASC');
    res.status(200).json({ settings: result.rows });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating notification settings:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
};

export const triggerReminders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Run the reminder logic asynchronously so we don't block the response for too long
    runAllFutureReminders().catch(error => console.error('Error in manual reminder trigger:', error));
    res.status(200).json({ message: 'Reminder process started successfully.' });
  } catch (error) {
    console.error('Error triggering reminders:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
