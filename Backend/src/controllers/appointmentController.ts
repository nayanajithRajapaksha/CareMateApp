import { Response } from 'express';
import pool from '../config/db';
import { AuthRequest } from '../middleware/authMiddleware';

const SLOT_MINUTES = 30;

const toMinutes = (time: string): number => {
  const [hours, minutes] = time.slice(0, 5).split(':').map(Number);
  return hours * 60 + minutes;
};

const toTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60).toString().padStart(2, '0');
  const remainder = (minutes % 60).toString().padStart(2, '0');
  return `${hours}:${remainder}`;
};

export const getAvailability = async (req: AuthRequest, res: Response): Promise<void> => {
  const { clinic_id, date } = req.query as { clinic_id?: string; date?: string };
  if (!clinic_id || !date) {
    res.status(400).json({ error: 'clinic_id and date are required.' });
    return;
  }

  try {
    const clinicResult = await pool.query('SELECT id, name FROM clinics WHERE id = $1', [clinic_id]);
    if (clinicResult.rows.length === 0) {
      res.status(404).json({ error: 'Clinic not found.' });
      return;
    }

    const midwives = await pool.query(
      `SELECT p.id, p.full_name, a.start_time, a.end_time, a.max_bookings
       FROM profiles p
      JOIN midwife_availability a ON a.midwife_id = p.id::text
       WHERE p.role = 'phm' AND LOWER(a.hospital) = LOWER($1) AND a.availability_date = $2 AND a.active = TRUE`,
      [clinicResult.rows[0].name, date]
    );

    const bookings = await pool.query(
      `SELECT midwife_id, start_time, COUNT(*)::int AS booked
       FROM appointments
       WHERE clinic_id = $1 AND appointment_date = $2 AND status = 'booked'
       GROUP BY midwife_id, start_time`,
      [clinic_id, date]
    );
    const bookedByMidwife = new Map<string, number>();
    bookings.rows.forEach(row => bookedByMidwife.set(`${row.midwife_id}:${String(row.start_time).slice(0, 5)}`, row.booked));

    const slots: Array<{ start_time: string; end_time: string; available: boolean; remaining: number }> = [];
    const configuredMidwives = midwives.rows;
    const slotKeys = new Set<string>();

    configuredMidwives.forEach(midwife => {
      for (let cursor = toMinutes(String(midwife.start_time)); cursor + SLOT_MINUTES <= toMinutes(String(midwife.end_time)); cursor += SLOT_MINUTES) {
        const start = toTime(cursor);
        const end = toTime(cursor + SLOT_MINUTES);
        const key = `${start}:${end}`;
        if (slotKeys.has(key)) continue;
        slotKeys.add(key);
        const remaining = configuredMidwives
          .filter(candidate => toMinutes(String(candidate.start_time)) <= cursor && toMinutes(String(candidate.end_time)) >= cursor + SLOT_MINUTES)
          .reduce((total, candidate) => total + Math.max(0, Number(candidate.max_bookings) - (bookedByMidwife.get(`${candidate.id}:${start}`) || 0)), 0);
        slots.push({ start_time: start, end_time: end, available: remaining > 0, remaining });
      }
    });

    slots.sort((left, right) => left.start_time.localeCompare(right.start_time));
    res.status(200).json({ clinic: clinicResult.rows[0], date, slots });
  } catch (error) {
    console.error('Error fetching appointment availability:', error);
    res.status(500).json({ error: 'Internal server error while fetching appointment availability.' });
  }
};

export const getMyAvailability = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const hospital = req.query.hospital as string;
    let targetHospital = hospital;
    if (!targetHospital) {
      const profile = await pool.query('SELECT hospital FROM profiles WHERE id::text = $1 AND role = \'phm\'', [req.user?.id]);
      targetHospital = profile.rows[0]?.hospital?.split(',')[0].trim() || '';
    }

    const result = await pool.query(
      `SELECT hospital, availability_date::text, start_time, end_time, max_bookings, active
      FROM midwife_availability
      WHERE midwife_id = $1 AND hospital = $2
      ORDER BY availability_date`,
      [req.user?.id, targetHospital]
    );
    res.status(200).json({ availability: { hospital: targetHospital, dates: result.rows.filter(row => row.availability_date) } });
  } catch (error) {
    console.error('Error fetching midwife availability:', error);
    res.status(500).json({ error: 'Internal server error while fetching availability.' });
  }
};

export const updateMyAvailability = async (req: AuthRequest, res: Response): Promise<void> => {
  const { availability_date, start_time, end_time, max_bookings, active = true, hospital: reqHospital } = req.body;
  const start = toMinutes(String(start_time || ''));
  const end = toMinutes(String(end_time || ''));
  const capacity = Number(max_bookings);

  const requestedDate = new Date(`${availability_date}T00:00:00Z`);
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const lastAllowedDate = new Date(today);
  lastAllowedDate.setUTCDate(lastAllowedDate.getUTCDate() + 30);
  if (!availability_date || Number.isNaN(requestedDate.getTime()) || requestedDate < today || requestedDate > lastAllowedDate) {
    res.status(400).json({ error: 'Availability can only be changed for dates from today through the next 30 days.' });
    return;
  }

  if (active && (!start_time || !end_time || !Number.isInteger(capacity) || capacity < 1 || start >= end || (end - start) % SLOT_MINUTES !== 0)) {
    res.status(400).json({ error: 'Provide valid times and a maximum booking count of at least 1.' });
    return;
  }

  try {
    const profile = await pool.query('SELECT hospital FROM profiles WHERE id::text = $1 AND role = \'phm\'', [req.user?.id]);
    const allowedHospitals = profile.rows[0]?.hospital?.split(',').map((h: string) => h.trim()) || [];
    const targetHospital = reqHospital || allowedHospitals[0];

    if (!targetHospital || !allowedHospitals.includes(targetHospital)) {
      res.status(400).json({ error: 'You must provide a valid assigned hospital before setting availability.' });
      return;
    }

    const booked = await pool.query(
      `SELECT COUNT(*)::int AS count FROM appointments
       WHERE midwife_id = $1 AND appointment_date = $2 AND status = 'booked'`,
      [req.user?.id, availability_date]
    );
    if (!active && booked.rows[0].count > 0) {
      res.status(409).json({ error: 'This date has bookings and cannot be closed.' });
      return;
    }
    if (active && booked.rows[0].count > 0 && capacity < booked.rows[0].count) {
      res.status(409).json({ error: 'Maximum bookings cannot be lower than existing bookings.' });
      return;
    }

    const result = await pool.query(
      `INSERT INTO midwife_availability (midwife_id, hospital, availability_date, start_time, end_time, max_bookings, active)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (midwife_id, hospital, availability_date) DO UPDATE SET start_time = EXCLUDED.start_time,
         end_time = EXCLUDED.end_time, max_bookings = EXCLUDED.max_bookings, active = EXCLUDED.active, updated_at = NOW()
       RETURNING availability_date::text, start_time, end_time, max_bookings, active`,
      [req.user?.id, targetHospital, availability_date, start_time || '09:00', end_time || '15:00', capacity || 1, active]
    );
    res.status(200).json({ availability: { hospital: targetHospital, ...result.rows[0] } });
  } catch (error) {
    console.error('Error updating midwife availability:', error);
    res.status(500).json({ error: 'Internal server error while saving availability.' });
  }
};

export const createAppointment = async (req: AuthRequest, res: Response): Promise<void> => {
  const { clinic_id, child_id, appointment_date, start_time } = req.body;
  if (!clinic_id || !child_id || !appointment_date || !start_time) {
    res.status(400).json({ error: 'clinic_id, child_id, appointment_date, and start_time are required.' });
    return;
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('SELECT pg_advisory_xact_lock(hashtext($1))', [`appointment:${clinic_id}:${appointment_date}:${start_time}`]);

    const child = await client.query('SELECT id, full_name, dob FROM children WHERE id::text = $1 AND parent_id::text = $2', [child_id, req.user?.id]);
    if (child.rows.length === 0) {
      await client.query('ROLLBACK');
      res.status(404).json({ error: 'Child not found for this parent.' });
      return;
    }

    const clinic = await client.query('SELECT id, name FROM clinics WHERE id = $1', [clinic_id]);
    if (clinic.rows.length === 0) {
      await client.query('ROLLBACK');
      res.status(404).json({ error: 'Clinic not found.' });
      return;
    }

    const existingBooking = await client.query(
      `SELECT id FROM appointments WHERE child_id = $1 AND status = 'booked'`,
      [child_id]
    );
    if (existingBooking.rows.length > 0) {
      await client.query('ROLLBACK');
      res.status(409).json({ error: 'This child already has an active appointment booked. Please cancel it before booking another one.' });
      return;
    }

    const candidates = await client.query(
      `SELECT p.id, p.full_name, a.start_time, a.end_time, a.max_bookings
      FROM profiles p JOIN midwife_availability a ON a.midwife_id = p.id::text
       WHERE p.role = 'phm' AND LOWER(a.hospital) = LOWER($1) AND a.availability_date = $3 AND a.active = TRUE
         AND a.start_time <= $2::time AND a.end_time >= ($2::time + interval '30 minutes')`,
      [clinic.rows[0].name, start_time, appointment_date]
    );
    const validCandidates = candidates.rows;
    let selected = null;
    for (const candidate of validCandidates) {
      const count = await client.query(
        `SELECT COUNT(*)::int AS booked FROM appointments
         WHERE midwife_id = $1 AND appointment_date = $2 AND start_time = $3 AND status = 'booked'`,
        [candidate.id, appointment_date, start_time]
      );
      if (count.rows[0].booked < Number(candidate.max_bookings)) {
        selected = candidate;
        break;
      }
    }

    if (!selected) {
      await client.query('ROLLBACK');
      res.status(409).json({ error: 'That 30-minute time slot is fully booked.' });
      return;
    }

    const appointment = await client.query(
      `INSERT INTO appointments (parent_id, child_id, midwife_id, clinic_id, appointment_date, start_time, end_time, status)
       VALUES ($1, $2, $3, $4, $5, $6, $6::time + interval '30 minutes', 'booked')
       RETURNING id, appointment_date, start_time, end_time`,
      [req.user?.id, child_id, selected.id, clinic_id, appointment_date, start_time]
    );
    await client.query('COMMIT');
    res.status(201).json({ appointment: { ...appointment.rows[0], child: child.rows[0], clinic: clinic.rows[0], midwife: selected } });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating appointment:', error);
    res.status(500).json({ error: 'Internal server error while booking appointment.' });
  } finally {
    client.release();
  }
};

export const getMyAppointments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      `SELECT a.*, c.name AS clinic_name, ch.full_name AS child_name, ch.dob AS child_dob,
              p.full_name AS midwife_name
      FROM appointments a JOIN clinics c ON c.id = a.clinic_id
      JOIN children ch ON ch.id::text = a.child_id JOIN profiles p ON p.id::text = a.midwife_id
       WHERE a.parent_id = $1 ORDER BY a.appointment_date DESC, a.start_time DESC`,
      [req.user?.id]
    );
    res.status(200).json({ appointments: result.rows });
  } catch (error) {
    console.error('Error fetching parent appointments:', error);
    res.status(500).json({ error: 'Internal server error while fetching appointments.' });
  }
};

export const cancelAppointment = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  if (!id) {
    res.status(400).json({ error: 'Appointment ID is required.' });
    return;
  }
  try {
    const appointmentResult = await pool.query('SELECT * FROM appointments WHERE id = $1 AND parent_id = $2', [id, req.user?.id]);
    if (appointmentResult.rows.length === 0) {
      res.status(404).json({ error: 'Appointment not found.' });
      return;
    }
    const appointment = appointmentResult.rows[0];
    if (appointment.status !== 'booked') {
      res.status(400).json({ error: 'Appointment is already ' + appointment.status + '.' });
      return;
    }
    
    // Check if appointment is at least 1 day away
    const appointmentDate = new Date(appointment.appointment_date);
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const diffTime = appointmentDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) {
      res.status(400).json({ error: 'Appointments can only be cancelled at least 1 day in advance.' });
      return;
    }

    await pool.query("UPDATE appointments SET status = 'cancelled' WHERE id = $1", [id]);
    res.status(200).json({ success: true, message: 'Appointment cancelled successfully.' });
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    res.status(500).json({ error: 'Internal server error while cancelling appointment.' });
  }
};

export const getStaffAppointments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const hospital = req.query.hospital as string;
    let targetHospital = hospital;
    if (!targetHospital) {
      const profile = await pool.query('SELECT hospital FROM profiles WHERE id::text = $1 AND role = \'phm\'', [req.user?.id]);
      targetHospital = profile.rows[0]?.hospital?.split(',')[0].trim() || '';
    }

    const result = await pool.query(
      `SELECT a.id, a.appointment_date::text, a.start_time, a.end_time, a.status,
              ch.full_name AS child_name, ch.dob AS child_dob,
              p.full_name AS parent_name, p.contact_number AS parent_contact,
              c.name AS clinic_name
      FROM appointments a JOIN children ch ON ch.id::text = a.child_id
      JOIN profiles p ON p.id::text = a.parent_id JOIN clinics c ON c.id = a.clinic_id
       WHERE a.midwife_id = $1 AND a.status = 'booked' AND c.name = $2
       ORDER BY a.appointment_date, a.start_time`,
      [req.user?.id, targetHospital]
    );
    res.status(200).json({ appointments: result.rows });
  } catch (error) {
    console.error('Error fetching midwife appointments:', error);
    res.status(500).json({ error: 'Internal server error while fetching bookings.' });
  }
};
