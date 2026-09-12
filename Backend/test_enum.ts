import pool from './src/config/db';

async function test() {
  try {
    const res = await pool.query("SELECT t.typname, e.enumlabel FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'user_role'");
    console.log('Enum values:', res.rows);
  } catch (e) {
    console.error(e);
  } finally {
    pool.end();
  }
}

test();
