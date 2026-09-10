import pool from './src/config/db';

async function test() {
  try {
    const parent_id = '3c3966fc-9d21-4f59-b734-46e1bf61b002'; // UUID of user1
    const res = await pool.query(
      `SELECT 
        c.id, c.full_name, c.dob, c.gender, c.relationship, c.birth_cert_number,
        m.blood_group, m.birth_weight_kg, m.allergies, m.existing_conditions, m.primary_clinic
       FROM children c
       LEFT JOIN child_medical_profiles m ON c.id = m.child_id
       WHERE c.parent_id = $1
       ORDER BY c.created_at ASC`,
      [parent_id]
    );
    console.log(res.rows);
  } catch (e) {
    console.error(e);
  } finally {
    pool.end();
  }
}

test();
