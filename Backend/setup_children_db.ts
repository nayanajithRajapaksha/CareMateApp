import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const setupDB = async () => {
  try {
    await pool.query(`
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

      CREATE TABLE IF NOT EXISTS children (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        parent_id UUID NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
        full_name VARCHAR(255) NOT NULL,
        dob DATE NOT NULL,
        gender VARCHAR(50) NOT NULL,
        relationship VARCHAR(50) NOT NULL,
        birth_cert_number VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS child_medical_profiles (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        child_id UUID NOT NULL UNIQUE REFERENCES children(id) ON DELETE CASCADE,
        blood_group VARCHAR(10) NOT NULL,
        birth_weight_kg NUMERIC NOT NULL,
        allergies TEXT,
        existing_conditions TEXT,
        primary_clinic VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Tables "children" and "child_medical_profiles" created successfully.');
  } catch (err) {
    console.error('Error creating tables:', err);
  } finally {
    await pool.end();
  }
};

setupDB();
