import { Request, Response } from 'express';
import pool from '../config/db';
import { AuthRequest } from '../middleware/authMiddleware';

// GET /api/clinics — public (mobile app + web)
export const getAllClinics = async (_req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      `SELECT id, name, address, type, lat, lng, is_open AS open, phone, hours, created_at, updated_at
       FROM clinics ORDER BY name ASC`
    );
    res.status(200).json({ clinics: result.rows });
  } catch (error) {
    console.error('Error fetching clinics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// POST /api/clinics — MOH supervisor only
export const createClinic = async (req: AuthRequest, res: Response): Promise<void> => {
  const { name, address, type, lat, lng, open, phone, hours } = req.body;

  if (!name || !address || !type || lat == null || lng == null) {
    res.status(400).json({ error: 'name, address, type, lat, and lng are required.' });
    return;
  }

  try {
    const result = await pool.query(
      `INSERT INTO clinics (name, address, type, lat, lng, is_open, phone, hours, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id, name, address, type, lat, lng, is_open AS open, phone, hours, created_at, updated_at`,
      [name, address, type, lat, lng, open ?? true, phone ?? null, hours ?? null, req.user?.id ?? null]
    );
    res.status(201).json({ clinic: result.rows[0] });
  } catch (error) {
    console.error('Error creating clinic:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// PUT /api/clinics/:id — MOH supervisor only
export const updateClinic = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { name, address, type, lat, lng, open, phone, hours } = req.body;

  if (!name || !address || !type || lat == null || lng == null) {
    res.status(400).json({ error: 'name, address, type, lat, and lng are required.' });
    return;
  }

  try {
    const result = await pool.query(
      `UPDATE clinics
       SET name=$1, address=$2, type=$3, lat=$4, lng=$5, is_open=$6, phone=$7, hours=$8, updated_at=NOW()
       WHERE id=$9
       RETURNING id, name, address, type, lat, lng, is_open AS open, phone, hours, created_at, updated_at`,
      [name, address, type, lat, lng, open ?? true, phone ?? null, hours ?? null, id]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Clinic not found.' });
      return;
    }
    res.status(200).json({ clinic: result.rows[0] });
  } catch (error) {
    console.error('Error updating clinic:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// DELETE /api/clinics/:id — MOH supervisor only
export const deleteClinic = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM clinics WHERE id=$1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Clinic not found.' });
      return;
    }
    res.status(200).json({ message: 'Clinic deleted successfully.' });
  } catch (error) {
    console.error('Error deleting clinic:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
