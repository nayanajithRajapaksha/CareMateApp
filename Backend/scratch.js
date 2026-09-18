const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://postgres.brurxutqthyejlrmibtl:Nayan2002%40%40%40Nayan@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres' });
async function check() {
  try {
    const intervals = await pool.query('SELECT days_before FROM notification_settings');
    console.log('Active Intervals:', intervals.rows);
    const appointments = await pool.query('SELECT id, status, appointment_date, parent_id FROM appointments');
    console.log('All Appointments:', appointments.rows);
  } catch(e) {
    console.error(e);
  } finally {
    pool.end();
  }
}
check();

