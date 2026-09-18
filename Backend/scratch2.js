const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://postgres.brurxutqthyejlrmibtl:Nayan2002%40%40%40Nayan@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres' });
async function check() {
  try {
    const qAll = 'SELECT id, status, appointment_date, parent_id FROM appointments';
    const allMatches = await pool.query(qAll);
    console.log('All appointments:', allMatches.rows);
  } catch(e) {
    console.error(e);
  } finally {
    pool.end();
  }
}
check();

