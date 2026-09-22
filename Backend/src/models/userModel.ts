import pool, { clientQuery } from '../config/db';

export const findUserByEmail = async (email: string) => {
  const result = await clientQuery('SELECT * FROM app_users WHERE email = $1', [email]);
  return result.rows[0] || null;
};

export const findProfileById = async (id: number) => {
  const result = await clientQuery('SELECT role, full_name, avatar_url FROM profiles WHERE id = $1', [id]);
  return result.rows[0] || null;
};

export const initUserProfileSchema = async () => {
  try {
    await pool.query(`
      ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
    `);
    console.log('Verified avatar_url column in profiles table');
  } catch (err) {
    console.error('Error ensuring avatar_url column in profiles table:', err);
  }
};

