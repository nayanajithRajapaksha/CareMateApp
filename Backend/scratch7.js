const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgresql://postgres.brurxutqthyejlrmibtl:Nayan2002%40%40%40Nayan@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
});
pool.query(`
  SELECT column_name, data_type 
  FROM information_schema.columns 
  WHERE table_name = 'children'
`).then(res => {
  console.log('children columns:', res.rows);
  pool.end();
}).catch(console.error);
