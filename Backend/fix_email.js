const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://postgres.brurxutqthyejlrmibtl:Nayan2002%40%40%40Nayan@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres' });
async function fix() {
  try {
    const res = await pool.query("UPDATE app_users SET email = 'nayanajithrajapaksha75@gmail.com' WHERE email = 'www.cn200275@gmail.com'");
    console.log('Updated rows:', res.rowCount);
  } catch(e) {
    console.error(e);
  } finally {
    pool.end();
  }
}
fix();
