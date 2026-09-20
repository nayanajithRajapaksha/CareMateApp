require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function checkSchema() {
  const tables = ['profiles', 'clinics'];
  
  for (const table of tables) {
    const res = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = $1
    `, [table]);
    console.log(`\nTable: ${table}`);
    console.table(res.rows);
  }
  pool.end();
}

checkSchema().catch(console.error);
