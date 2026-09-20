const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres.brurxutqthyejlrmibtl:Nayan2002%40%40%40Nayan@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres' });
client.connect()
  .then(() => client.query('ALTER TABLE vaccines ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;'))
  .then(() => client.query('UPDATE vaccines SET is_active = TRUE WHERE is_active IS NULL;'))
  .then(() => { console.log('Successfully altered vaccines table'); client.end(); })
  .catch(err => { console.error(err); client.end(); });
