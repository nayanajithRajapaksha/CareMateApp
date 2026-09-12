import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool, { clientQuery } from '../config/db';
import { findUserByEmail, findProfileById } from '../models/userModel';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

export const register = async (req: Request, res: Response): Promise<void> => {
  const { password, full_name, contact_number } = req.body;
  let { email } = req.body;

  if (!email || !password || !full_name) {
    res.status(400).json({ error: 'Email, password, and full name are required.' });
    return;
  }

  email = email.toLowerCase().trim();

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Check if user exists
    const userCheck = await client.query('SELECT id FROM app_users WHERE email = $1', [email]);
    if (userCheck.rows.length > 0) {
      res.status(400).json({ error: 'User with this email already exists.' });
      return;
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Insert into app_users
    const userResult = await client.query(
      'INSERT INTO app_users (email, password_hash) VALUES ($1, $2) RETURNING id',
      [email, passwordHash]
    );
    const userId = userResult.rows[0].id;

    // Insert into profiles (default role is 'parent'/'user')
    await client.query(
      "INSERT INTO profiles (id, role, full_name, contact_number) VALUES ($1, 'parent', $2, $3)",
      [userId, full_name, contact_number || null]
    );

    await client.query('COMMIT');

    // Generate JWT
    const token = jwt.sign({ id: userId, email, role: 'parent' }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({ message: 'User created successfully', token, user: { id: userId, email, role: 'parent', full_name } });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Registration Error:', error);
    res.status(500).json({ error: 'Internal server error during registration.' });
  } finally {
    client.release();
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const { password } = req.body;
  let { email } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required.' });
    return;
  }

  email = email.toLowerCase().trim();

  try {
    const user = await findUserByEmail(email);
    if (!user) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    // Get Profile for role
    const profile = await findProfileById(user.id);

    const token = jwt.sign({ id: user.id, email: user.email, role: profile.role }, JWT_SECRET, { expiresIn: '7d' });

    res.status(200).json({ message: 'Login successful', token, user: { id: user.id, email: user.email, ...profile } });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ error: 'Internal server error during login.' });
  }
};
