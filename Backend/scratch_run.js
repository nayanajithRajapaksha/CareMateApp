const { runReminders } = require('./src/jobs/reminderCron');
require('dotenv').config();
runReminders().then(() => setTimeout(() => process.exit(0), 2000));

