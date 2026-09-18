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
      <!DOCTYPE html>
      <html>
      <body style="margin: 0; padding: 0; background-color: #f4f7f6; font-family: 'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif;">
        <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%); padding: 30px 20px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600; letter-spacing: 1px;">CareMate</h1>
            <p style="color: #e0e7ff; margin: 10px 0 0 0; font-size: 16px;">Password Reset Request</p>
          </div>
          
          <!-- Body -->
          <div style="padding: 40px 30px;">
            <h2 style="color: #2c3e50; font-size: 20px; margin-top: 0;">Hello,</h2>
            <p style="color: #596a7a; font-size: 16px; line-height: 1.6;">We received a request to reset your password for your CareMate account. Your password reset code is:</p>
            
            <!-- Details Card -->
            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 25px; margin: 30px 0; text-align: center;">
              <h1 style="color: #1e293b; font-size: 36px; letter-spacing: 4px; margin: 0;">${otp}</h1>
            </div>
            
            <p style="color: #596a7a; font-size: 16px; line-height: 1.6;">This code will expire in <strong>15 minutes</strong>.</p>
            <p style="color: #94a3b8; font-size: 14px; line-height: 1.6; margin-top: 30px;">If you didn't request a password reset, you can safely ignore this email.</p>
          </div>
          
          <!-- Footer -->
          <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #edf2f7;">
            <p style="color: #94a3b8; font-size: 14px; margin: 0;">&copy; ${new Date().getFullYear()} CareMate. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
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

