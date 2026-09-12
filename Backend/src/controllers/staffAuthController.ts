import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';
import prisma from '../config/prisma';
import { AuthRequest } from '../middleware/authMiddleware';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

export const registerPHM = async (req: Request, res: Response): Promise<void> => {
  const { email, password, full_name, contact_number, nic, clinic_id } = req.body;

  if (!email || !password || !full_name) {
    res.status(400).json({ error: 'Email, password, and full name are required.' });
    return;
  }

  const cleanEmail = email.toLowerCase().trim();

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existingUser) {
      res.status(400).json({ error: 'User with this email already exists.' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email: cleanEmail,
        passwordHash,
        role: Role.MIDWIFE,
        profile: {
          create: {
            fullName: full_name,
            contactNumber: contact_number || null,
            nic: nic || null,
            clinicId: clinic_id || null,
          },
        },
      },
      include: {
        profile: true,
      },
    });

    const token = jwt.sign(
      { id: user.id, email: cleanEmail, role: 'phm' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'PHM registered successfully.',
      token,
      user: {
        id: user.id,
        email: cleanEmail,
        role: 'phm',
        full_name: user.profile?.fullName || full_name,
      },
    });
  } catch (error) {
    console.error('PHM Registration Error:', error);
    res.status(500).json({ error: 'Internal server error during PHM registration.' });
  }
};

export const registerMOH = async (req: AuthRequest, res: Response): Promise<void> => {
  const { email, password, full_name, contact_number, clinic_id } = req.body;

  if (req.user?.role?.toLowerCase() !== 'admin') {
    res.status(403).json({ error: 'Forbidden. Only Admins can register MOH supervisors.' });
    return;
  }

  if (!email || !password || !full_name) {
    res.status(400).json({ error: 'Email, password, and full name are required.' });
    return;
  }

  const cleanEmail = email.toLowerCase().trim();

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existingUser) {
      res.status(400).json({ error: 'User with this email already exists.' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email: cleanEmail,
        passwordHash,
        role: Role.MOH,
        profile: {
          create: {
            fullName: full_name,
            contactNumber: contact_number || null,
            clinicId: clinic_id || null,
          },
        },
      },
      include: {
        profile: true,
      },
    });

    res.status(201).json({
      message: 'MOH registered successfully',
      user: {
        id: user.id,
        email: cleanEmail,
        role: 'moh',
        full_name: user.profile?.fullName || full_name,
      },
    });
  } catch (error) {
    console.error('MOH Registration Error:', error);
    res.status(500).json({ error: 'Internal server error during MOH registration.' });
  }
};
