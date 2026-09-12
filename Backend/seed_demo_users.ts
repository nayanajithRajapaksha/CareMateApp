import bcrypt from 'bcrypt';
import pool from './src/config/db';

const demoUsers = [
  { email: 'admin@caremate.gov', password: 'Admin@123', role: 'admin', fullName: 'System Administrator' },
  { email: 'moh@caremate.gov', password: 'Moh@123', role: 'moh', fullName: 'MOH Officer' },
  { email: 'midwife@caremate.gov', password: 'Midwife@123', role: 'phm', fullName: 'Public Health Midwife' },
  { email: 'parent@caremate.gov', password: 'Parent@123', role: 'parent', fullName: 'Nimal Silva' },
];

const seedDemoUsers = async (): Promise<void> => {
  const client = await pool.connect();

  try {
    await client.query("ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'moh'");
    await client.query('BEGIN');

    for (const demoUser of demoUsers) {
      const passwordHash = await bcrypt.hash(demoUser.password, 10);
      const userResult = await client.query(
        `INSERT INTO app_users (email, password_hash)
         VALUES ($1, $2)
         ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash
         RETURNING id`,
        [demoUser.email, passwordHash]
      );

      await client.query(
        `INSERT INTO profiles (id, role, full_name)
         VALUES ($1, $2, $3)
         ON CONFLICT (id) DO UPDATE SET role = EXCLUDED.role, full_name = EXCLUDED.full_name`,
        [userResult.rows[0].id, demoUser.role, demoUser.fullName]
      );
    }

    await client.query('COMMIT');
    console.log('Demo users seeded successfully.');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
};

seedDemoUsers().catch(error => {
  console.error('Failed to seed demo users:', error);
  process.exitCode = 1;
});