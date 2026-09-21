import pool from './src/config/db';

async function updateSchema() {
  try {
    console.log('Adding notification setting columns to profiles table...');
    await pool.query(`
      ALTER TABLE profiles 
      ADD COLUMN IF NOT EXISTS email_notifications BOOLEAN DEFAULT true,
      ADD COLUMN IF NOT EXISTS push_notifications BOOLEAN DEFAULT true;
    `);
    
    console.log('Columns added successfully.');
    
    const res = await pool.query('SELECT column_name, data_type FROM information_schema.columns WHERE table_name = $1', ['profiles']);
    console.log('Profiles table schema:', res.rows);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}

updateSchema();
