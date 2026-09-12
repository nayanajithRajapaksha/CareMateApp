import pool from './src/config/db';

async function check() {
  const res = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'app_users'");
  console.log(res.rows);
  pool.end();
}
check();
