require('dotenv').config();
const { runReminders } = require('./src/jobs/reminderCron');
runReminders().then(() => {
  setTimeout(() => process.exit(0), 5000);
});

