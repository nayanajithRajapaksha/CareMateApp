const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://postgres.brurxutqthyejlrmibtl:Nayan2002%40%40%40Nayan@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres' });
async function check() {
  try {
    const q = `
      SELECT a.id, a.appointment_date, a.start_time, c.name AS clinic_name, 
             u.email, p.full_name AS parent_name
      FROM appointments a
      JOIN clinics c ON c.id = a.clinic_id
      JOIN app_users u ON u.id::text = a.parent_id
      JOIN profiles p ON p.id::text = a.parent_id
      WHERE a.status = 'booked' 
        AND a.appointment_date = CURRENT_DATE + INTERVAL '3 days'
    `;
    const matches = await pool.query(q);
    console.log('Matches for 3 days:', matches.rows);

    const qAll = `
      SELECT a.id, a.appointment_date, a.start_time, c.name AS clinic_name, 
             u.email, p.full_name AS parent_name
      FROM appointments a
      JOIN clinics c ON c.id = a.clinic_id
      JOIN app_users u ON u.id::text = a.parent_id
      JOIN profiles p ON p.id::text = a.parent_id
      WHERE a.status = 'booked'
    `;
    const allMatches = await pool.query(qAll);
    console.log('All booked appointments:', allMatches.rows);
  } catch(e) {
    console.error(e);
  } finally {
    pool.end();
  }
}
check();
