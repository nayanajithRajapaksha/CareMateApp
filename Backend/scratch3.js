const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://postgres.brurxutqthyejlrmibtl:Nayan2002%40%40%40Nayan@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres' });
async function check() {
  try {
    const query = `
      SELECT CURRENT_DATE, (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Colombo')::date as sl_date;
    `;
    const res = await pool.query(query);
    console.log(res.rows[0]);
  } catch(e) {
    console.error(e);
  } finally {
    pool.end();
  }
}
check();
