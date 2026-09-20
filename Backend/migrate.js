require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function run() {
  try {
    await pool.query('ALTER TABLE vaccines ADD COLUMN IF NOT EXISTS dose_number INT DEFAULT 1;');
    await pool.query('ALTER TABLE vaccines ADD COLUMN IF NOT EXISTS previous_dose_id UUID REFERENCES vaccines(id) ON DELETE SET NULL;');
    console.log('Migration successful');
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}
run();
