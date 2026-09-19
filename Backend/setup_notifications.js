require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function setupDatabase() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    console.log('Creating app_notifications table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS app_notifications (
        id SERIAL PRIMARY KEY,
        user_id UUID REFERENCES app_users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        type VARCHAR(50) DEFAULT 'general',
        is_read BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    console.log('Adding index on user_id for faster queries...');
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_app_notifications_user_id ON app_notifications(user_id)
    `);
    
    await client.query('COMMIT');
    console.log('Successfully created app_notifications table!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error setting up notifications table:', err);
  } finally {
    client.release();
    pool.end();
  }
}

setupDatabase();
