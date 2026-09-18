const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgresql://postgres.brurxutqthyejlrmibtl:Nayan2002%40%40%40Nayan@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
});
pool.query(`
  SELECT table_name, column_name, data_type 
  FROM information_schema.columns 
  WHERE table_name IN ('users', 'parent_profiles')
`).then(res => {
  console.log(JSON.stringify(res.rows, null, 2));
  pool.end();
}).catch(console.error);
