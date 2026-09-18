const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://postgres.brurxutqthyejlrmibtl:Nayan2002%40%40%40Nayan@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres' });
async function check() {
  try {
    const query = `
      SELECT a.id as appointment_id, c.name as clinic_name, p.hospital as midwife_hospital
      FROM appointments a
      JOIN clinics c ON a.clinic_id = c.id
      CROSS JOIN (SELECT hospital FROM profiles WHERE role = 'phm' AND hospital IS NOT NULL LIMIT 1) p
      LIMIT 5;
    `;
    const res = await pool.query(query);
    console.log(res.rows);
  } catch(e) {
    console.error(e);
  } finally {
    pool.end();
  }
}
check();
