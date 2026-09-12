import pool from './src/config/db';

async function migrate() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Add hospital to profiles table
    await client.query(`
      ALTER TABLE profiles 
      ADD COLUMN IF NOT EXISTS hospital VARCHAR(255);
    `);

    await client.query('COMMIT');
    console.log("Migration successful");
  } catch (e) {
    await client.query('ROLLBACK');
    console.error(e);
  } finally {
    client.release();
    pool.end();
  }
}

migrate();
