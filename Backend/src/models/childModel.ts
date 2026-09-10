import pool from '../config/db';

export interface ChildData {
  parent_id: string;
  full_name: string;
  dob: string; // YYYY-MM-DD
  gender: string;
  relationship: string;
  birth_cert_number?: string;
}

export interface MedicalProfileData {
  blood_group: string;
  birth_weight_kg: number;
  allergies?: string;
  existing_conditions?: string;
  primary_clinic?: string;
}

export const createChildWithMedicalProfile = async (child: ChildData, medical: MedicalProfileData) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const childRes = await client.query(
      `INSERT INTO children (parent_id, full_name, dob, gender, relationship, birth_cert_number) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      [child.parent_id, child.full_name, child.dob, child.gender, child.relationship, child.birth_cert_number || null]
    );
    
    const childId = childRes.rows[0].id;

    await client.query(
      `INSERT INTO child_medical_profiles (child_id, blood_group, birth_weight_kg, allergies, existing_conditions, primary_clinic)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [childId, medical.blood_group, medical.birth_weight_kg, medical.allergies || null, medical.existing_conditions || null, medical.primary_clinic || null]
    );

    await client.query('COMMIT');
    return childId;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

export const getChildrenByParentId = async (parent_id: string) => {
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
  return res.rows;
};
