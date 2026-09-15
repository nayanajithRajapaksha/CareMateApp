import pool from './config/db';

async function run() {
  try {
    const child_id = '5cca37a6-7d50-4272-add4-ccdb53dec38f';
    const existingBooking = await pool.query(
      `SELECT id FROM appointments WHERE child_id = $1 AND status = 'booked'`,
      [child_id]
    );
    console.table(existingBooking.rows);
  } catch (e) {
    console.error(e);
  } finally {
    await pool.end();
  }
}
run();
