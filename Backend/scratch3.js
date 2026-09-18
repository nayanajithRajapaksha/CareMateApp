const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://postgres.brurxutqthyejlrmibtl:Nayan2002%40%40%40Nayan@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres' });
async function check() {
  try {
    const query = `
      SELECT p.id as profile_id, a.email, p.full_name, p.contact_number, p.created_at,
              COUNT(c.id)::int as children_count,
              COALESCE(json_agg(json_build_object(
                  'id', c.id, 
                  'name', c.full_name, 
                  'dob', c.dob,
                  'next_appointment_date', (SELECT appointment_date FROM appointments WHERE child_id = c.id::text AND appointment_date >= CURRENT_DATE ORDER BY appointment_date ASC, start_time ASC LIMIT 1),
                  'next_appointment_time', (SELECT start_time FROM appointments WHERE child_id = c.id::text AND appointment_date >= CURRENT_DATE ORDER BY appointment_date ASC, start_time ASC LIMIT 1)
              )) FILTER (WHERE c.id IS NOT NULL), '[]'::json) as children_list
       FROM profiles p
       JOIN app_users a ON p.id = a.id
       LEFT JOIN children c ON p.id = c.parent_id
       WHERE p.role = 'parent'
       GROUP BY p.id, a.email, p.full_name, p.contact_number, p.created_at
       ORDER BY p.created_at DESC
       LIMIT 2;
    `;
    const res = await pool.query(query);
    console.log(JSON.stringify(res.rows, null, 2));
  } catch(e) {
    console.error(e);
  } finally {
    pool.end();
  }
}
check();
