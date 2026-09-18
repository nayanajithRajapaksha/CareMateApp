const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgresql://postgres.brurxutqthyejlrmibtl:Nayan2002%40%40%40Nayan@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
});
pool.query(`
  ALTER TABLE children ADD COLUMN IF NOT EXISTS profile_pic_url TEXT;
`).then(() => {
  console.log('Added profile_pic_url to children table successfully.');
  pool.end();
}).catch(console.error);
