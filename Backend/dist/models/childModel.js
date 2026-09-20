"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllChildren = exports.updateChildMedicalProfile = exports.updateChildDetails = exports.getChildrenByParentId = exports.createChildWithMedicalProfile = void 0;
const db_1 = __importDefault(require("../config/db"));
const createChildWithMedicalProfile = async (child, medical) => {
    const client = await db_1.default.connect();
    try {
        await client.query('BEGIN');
        const childRes = await client.query(`INSERT INTO children (parent_id, full_name, dob, gender, relationship, birth_cert_number) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`, [child.parent_id, child.full_name, child.dob, child.gender, child.relationship, child.birth_cert_number || null]);
        const childId = childRes.rows[0].id;
        await client.query(`INSERT INTO child_medical_profiles (child_id, blood_group, birth_weight_kg, allergies, existing_conditions, primary_clinic)
       VALUES ($1, $2, $3, $4, $5, $6)`, [childId, medical.blood_group, medical.birth_weight_kg, medical.allergies || null, medical.existing_conditions || null, medical.primary_clinic || null]);
        await client.query('COMMIT');
        return childId;
    }
    catch (err) {
        await client.query('ROLLBACK');
        throw err;
    }
    finally {
        client.release();
    }
};
exports.createChildWithMedicalProfile = createChildWithMedicalProfile;
const getChildrenByParentId = async (parent_id) => {
    const res = await db_1.default.query(`SELECT 
      c.id, c.full_name, c.dob, c.gender, c.relationship, c.birth_cert_number, c.profile_pic_url,
      m.blood_group, m.birth_weight_kg, m.allergies, m.existing_conditions, m.primary_clinic
     FROM children c
     LEFT JOIN child_medical_profiles m ON c.id = m.child_id
     WHERE c.parent_id = $1
     ORDER BY c.created_at ASC`, [parent_id]);
    return res.rows;
};
exports.getChildrenByParentId = getChildrenByParentId;
const updateChildDetails = async (child_id, child) => {
    const fields = [];
    const values = [];
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
    if (fields.length === 0)
        return;
    values.push(child_id);
    const query = `UPDATE children SET ${fields.join(', ')} WHERE id = $${index}`;
    await db_1.default.query(query, values);
};
exports.updateChildDetails = updateChildDetails;
const updateChildMedicalProfile = async (child_id, medical) => {
    const fields = [];
    const values = [];
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
    if (fields.length === 0)
        return;
    values.push(child_id);
    const query = `UPDATE child_medical_profiles SET ${fields.join(', ')} WHERE child_id = $${index}`;
    await db_1.default.query(query, values);
};
exports.updateChildMedicalProfile = updateChildMedicalProfile;
const getAllChildren = async (hospitals = []) => {
    let query = `
    SELECT 
      c.id, c.full_name, c.dob, c.gender, c.relationship, c.birth_cert_number, c.parent_id,
      m.blood_group, m.birth_weight_kg, m.allergies, m.existing_conditions, m.primary_clinic
     FROM children c
     LEFT JOIN child_medical_profiles m ON c.id = m.child_id
  `;
    const values = [];
    if (hospitals.length > 0) {
        query += ` WHERE m.primary_clinic = ANY($1)`;
        values.push(hospitals);
    }
    query += ` ORDER BY c.created_at DESC`;
    const res = await db_1.default.query(query, values);
    return res.rows;
};
exports.getAllChildren = getAllChildren;
//# sourceMappingURL=childModel.js.map