import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../config/db';
import { AuthRequest } from '../middleware/authMiddleware';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

export const registerPHM = async (req: Request, res: Response): Promise<void> => {
  const { email, password, full_name, contact_number } = req.body;

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

    // hospital is implicitly null, meaning unassigned
    await client.query(
      "INSERT INTO profiles (id, role, full_name, contact_number) VALUES ($1, 'phm', $2, $3)",
      [userId, full_name, contact_number || null]
    );

    await client.query('COMMIT');

    const token = jwt.sign({ id: userId, email: cleanEmail, role: 'phm' }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ message: 'PHM registered successfully. Awaiting hospital assignment.', token, user: { id: userId, email: cleanEmail, role: 'phm', full_name } });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('PHM Registration Error:', error);
    res.status(500).json({ error: 'Internal server error during PHM registration.' });
  } finally {
    client.release();
  }
};

export const registerMOH = async (req: AuthRequest, res: Response): Promise<void> => {
  const { email, password, full_name, contact_number } = req.body;

  if (req.user?.role?.toLowerCase() !== 'admin') {
    res.status(403).json({ error: 'Forbidden. Only Admins can register MOH supervisors.' });
    return;
  }

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
      "INSERT INTO profiles (id, role, full_name, contact_number) VALUES ($1, 'moh', $2, $3)",
      [userId, full_name, contact_number || null]
    );

    await client.query('COMMIT');
    res.status(201).json({ message: 'MOH registered successfully', user: { id: userId, email: cleanEmail, role: 'moh', full_name } });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('MOH Registration Error:', error);
    res.status(500).json({ error: 'Internal server error during MOH registration.' });
  } finally {
    client.release();
  }
};
