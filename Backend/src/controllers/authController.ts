import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool, { clientQuery } from '../config/db';
import { findUserByEmail, findProfileById } from '../models/userModel';
import { sendEmailReminder } from '../services/notificationService';

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
      res.status(401).json({ error: 'Wrong password or email.' });
      return;
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      res.status(401).json({ error: 'Wrong password or email.' });
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

export const changePassword = async (req: any, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { currentPassword, newPassword } = req.body;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    if (!currentPassword || !newPassword) {
      res.status(400).json({ error: 'Current password and new password are required.' });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({ error: 'New password must be at least 6 characters long.' });
      return;
    }

    const userResult = await pool.query('SELECT password_hash FROM app_users WHERE id = $1', [userId]);
    const user = userResult.rows[0];

    if (!user) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }

    const passwordMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!passwordMatch) {
      res.status(401).json({ error: 'Current password is incorrect.' });
      return;
    }

    if (currentPassword === newPassword) {
      res.status(400).json({ error: 'New password must be different from your current password.' });
      return;
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE app_users SET password_hash = $1 WHERE id = $2', [passwordHash, userId]);

    res.status(200).json({ message: 'Password updated successfully.' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Internal server error while updating password.' });
  }
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;
  
  if (!email) {
    res.status(400).json({ error: 'Email is required.' });
    return;
  }

  const normalizedEmail = email.toLowerCase().trim();

  try {
    const user = await findUserByEmail(normalizedEmail);
    if (!user) {
      // Don't leak whether user exists for security reasons
      res.status(200).json({ message: 'If that email is in our system, we have sent a reset code.' });
      return;
    }

    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);

    // Delete any existing tokens for this email
    await pool.query('DELETE FROM password_reset_tokens WHERE email = $1', [normalizedEmail]);
    
    // Save new token
    await pool.query(
      'INSERT INTO password_reset_tokens (email, token, expires_at) VALUES ($1, $2, $3)',
      [normalizedEmail, otp, expiresAt]
    );

    const emailHtml = `
      <div style="font-family: sans-serif; color: #333; padding: 20px;">
        <h2>Password Reset Code</h2>
        <p>You requested a password reset for your CareMate account.</p>
        <p>Your 6-digit reset code is: <strong>${otp}</strong></p>
        <p>This code will expire in 15 minutes.</p>
        <p>If you did not request this, please ignore this email.</p>
      </div>
    `;

    await sendEmailReminder(normalizedEmail, 'CareMate Password Reset', emailHtml);

    res.status(200).json({ message: 'If that email is in our system, we have sent a reset code.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  const { email, token, newPassword } = req.body;

  if (!email || !token || !newPassword) {
    res.status(400).json({ error: 'Email, token, and new password are required.' });
    return;
  }

  if (newPassword.length < 6) {
    res.status(400).json({ error: 'New password must be at least 6 characters long.' });
    return;
  }

  const normalizedEmail = email.toLowerCase().trim();

  try {
    const tokenResult = await pool.query(
      'SELECT * FROM password_reset_tokens WHERE email = $1 AND token = $2',
      [normalizedEmail, token]
    );

    if (tokenResult.rows.length === 0) {
      res.status(400).json({ error: 'Invalid or expired reset code.' });
      return;
    }

    const resetRecord = tokenResult.rows[0];
    if (new Date() > new Date(resetRecord.expires_at)) {
      await pool.query('DELETE FROM password_reset_tokens WHERE email = $1', [normalizedEmail]);
      res.status(400).json({ error: 'Reset code has expired. Please request a new one.' });
      return;
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE app_users SET password_hash = $1 WHERE email = $2', [passwordHash, normalizedEmail]);
    
    // Clean up the token
    await pool.query('DELETE FROM password_reset_tokens WHERE email = $1', [normalizedEmail]);

    res.status(200).json({ message: 'Password has been reset successfully. You can now log in.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

