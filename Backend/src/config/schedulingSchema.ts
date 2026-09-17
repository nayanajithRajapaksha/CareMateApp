import pool from './db';

export const ensureSchedulingSchema = async (): Promise<void> => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS midwife_availability (
      id BIGSERIAL PRIMARY KEY,
      midwife_id TEXT NOT NULL UNIQUE,
      availability_date DATE,
      start_time TIME NOT NULL,
      end_time TIME NOT NULL,
      max_bookings INTEGER NOT NULL CHECK (max_bookings > 0),
      active BOOLEAN NOT NULL DEFAULT TRUE,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    ALTER TABLE midwife_availability ADD COLUMN IF NOT EXISTS availability_date DATE;
    ALTER TABLE midwife_availability ADD COLUMN IF NOT EXISTS hospital TEXT;
    UPDATE midwife_availability SET availability_date = CURRENT_DATE WHERE availability_date IS NULL;
    UPDATE midwife_availability SET hospital = 'Base Hospital Medirigiriya' WHERE hospital IS NULL;
    ALTER TABLE midwife_availability ALTER COLUMN availability_date SET NOT NULL;
    ALTER TABLE midwife_availability ALTER COLUMN hospital SET NOT NULL;
    ALTER TABLE midwife_availability DROP CONSTRAINT IF EXISTS midwife_availability_midwife_id_key;
    ALTER TABLE midwife_availability DROP CONSTRAINT IF EXISTS midwife_availability_midwife_date_key;
    DROP INDEX IF EXISTS midwife_availability_midwife_date_key;
    CREATE UNIQUE INDEX IF NOT EXISTS midwife_availability_midwife_hospital_date_key
      ON midwife_availability (midwife_id, hospital, availability_date);

    CREATE TABLE IF NOT EXISTS appointments (
      id BIGSERIAL PRIMARY KEY,
      parent_id TEXT NOT NULL,
      child_id TEXT NOT NULL,
      midwife_id TEXT NOT NULL,
      clinic_id BIGINT NOT NULL,
      appointment_date DATE NOT NULL,
      start_time TIME NOT NULL,
      end_time TIME NOT NULL,
      status TEXT NOT NULL DEFAULT 'booked' CHECK (status IN ('booked', 'cancelled', 'completed')),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS appointments_midwife_schedule_idx
      ON appointments (midwife_id, appointment_date, start_time, status);
    CREATE INDEX IF NOT EXISTS appointments_parent_idx
      ON appointments (parent_id, appointment_date);

    CREATE TABLE IF NOT EXISTS notification_settings (
      id SERIAL PRIMARY KEY,
      days_before INTEGER NOT NULL UNIQUE
    );
    
    INSERT INTO notification_settings (days_before) 
    VALUES (1), (7) 
    ON CONFLICT DO NOTHING;
  `);
};
