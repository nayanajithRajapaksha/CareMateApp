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
      c.id, c.full_name, c.dob, c.gender, c.relationship, c.birth_cert_number, c.profile_pic_url,
      m.blood_group, m.birth_weight_kg, m.allergies, m.existing_conditions, m.primary_clinic
     FROM children c
     LEFT JOIN child_medical_profiles m ON c.id = m.child_id
     WHERE c.parent_id = $1
     ORDER BY c.created_at ASC`,
    [parent_id]
  );
  return res.rows;
};

export const updateChildDetails = async (child_id: string, child: Partial<ChildData>) => {
  const fields: string[] = [];
  const values: any[] = [];
  let index = 1;

  if (child.full_name !== undefined) {
    fields.push(`full_name = $${index++}`);
    values.push(child.full_name);
  }
  if (child.dob !== undefined) {
    fields.push(`dob = $${index++}`);
    values.push(child.dob);
  }
  if (child.gender !== undefined) {
    fields.push(`gender = $${index++}`);
    values.push(child.gender);
  }
  if (child.relationship !== undefined) {
    fields.push(`relationship = $${index++}`);
    values.push(child.relationship);
  }
  if (child.birth_cert_number !== undefined) {
    fields.push(`birth_cert_number = $${index++}`);
    values.push(child.birth_cert_number || null);
  }

  if (fields.length === 0) return;

  values.push(child_id);
  const query = `UPDATE children SET ${fields.join(', ')} WHERE id = $${index}`;

  await pool.query(query, values);
};

export const updateChildMedicalProfile = async (child_id: string, medical: Partial<MedicalProfileData>) => {
  const fields: string[] = [];
  const values: any[] = [];
  let index = 1;

  if (medical.blood_group !== undefined) {
    fields.push(`blood_group = $${index++}`);
    values.push(medical.blood_group);
  }
  if (medical.birth_weight_kg !== undefined) {
    fields.push(`birth_weight_kg = $${index++}`);
    values.push(medical.birth_weight_kg);
  }
  if (medical.allergies !== undefined) {
    fields.push(`allergies = $${index++}`);
    values.push(medical.allergies);
  }
  if (medical.existing_conditions !== undefined) {
    fields.push(`existing_conditions = $${index++}`);
    values.push(medical.existing_conditions);
  }
  if (medical.primary_clinic !== undefined) {
    fields.push(`primary_clinic = $${index++}`);
    values.push(medical.primary_clinic);
  }

  if (fields.length === 0) return;

  values.push(child_id);
  const query = `UPDATE child_medical_profiles SET ${fields.join(', ')} WHERE child_id = $${index}`;

  await pool.query(query, values);
};

export const getAllChildren = async () => {
  const res = await pool.query(
    `SELECT 
      c.id, c.full_name, c.dob, c.gender, c.relationship, c.birth_cert_number, c.parent_id,
      m.blood_group, m.birth_weight_kg, m.allergies, m.existing_conditions, m.primary_clinic
     FROM children c
     LEFT JOIN child_medical_profiles m ON c.id = m.child_id
     ORDER BY c.created_at DESC`
  );
  return res.rows;
};

