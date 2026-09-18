const { runReminders } = require('./src/jobs/reminderCron.ts');
require('dotenv').config();
runReminders().then(() => setTimeout(() => process.exit(0), 5000));
