import pool, { clientQuery } from '../config/db';

export const findUserByEmail = async (email: string) => {
  const result = await clientQuery('SELECT * FROM app_users WHERE email = $1', [email]);
  return result.rows[0] || null;
};

export const findProfileById = async (id: number) => {
  const result = await clientQuery('SELECT role, full_name FROM profiles WHERE id = $1', [id]);
  return result.rows[0] || null;
};
