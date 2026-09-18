const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  const query = `
    CREATE TABLE IF NOT EXISTS clinic_specialists (
      id SERIAL PRIMARY KEY,
      clinic_id INTEGER REFERENCES clinics(id) ON DELETE CASCADE,
      full_name VARCHAR(255) NOT NULL,
      specialty VARCHAR(255) NOT NULL,
      contact_number VARCHAR(50),
      availability TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Colombo')
    );
  `;
  try {
    await pool.query(query);
    console.log('Table clinic_specialists created successfully.');
  } catch (e) {
    console.error('Error:', e);
  } finally {
    pool.end();
  }
}

run();
