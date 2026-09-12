import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';
import prisma from '../config/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

export const register = async (req: Request, res: Response): Promise<void> => {
  const { password, full_name, contact_number } = req.body;
  let { email } = req.body;

  if (!email || !password || !full_name) {
    res.status(400).json({ error: 'Email, password, and full name are required.' });
    return;
  }

  email = email.toLowerCase().trim();

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      res.status(400).json({ error: 'User with this email already exists.' });
      return;
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role: Role.PARENT,
        profile: {
          create: {
            fullName: full_name,
            contactNumber: contact_number || null,
          },
        },
      },
      include: {
        profile: true,
      },
    });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: 'parent' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: 'parent',
        full_name: user.profile?.fullName || full_name,
      },
    });
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ error: 'Internal server error during registration.' });
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
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        profile: true,
      },
    });

    if (!user) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const roleString = user.role.toLowerCase();

    const token = jwt.sign(
      { id: user.id, email: user.email, role: roleString },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: roleString,
        full_name: user.profile?.fullName || '',
        contact_number: user.profile?.contactNumber || null,
        address: user.profile?.address || null,
        nic: user.profile?.nic || null,
        clinic_id: user.profile?.clinicId || null,
      },
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ error: 'Internal server error during login.' });
  }
};
