"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initCronJobs = exports.runReminders = exports.runSingleReminder = exports.runAllFutureReminders = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const db_1 = __importDefault(require("../config/db"));
const notificationService_1 = require("../services/notificationService");
// Helper function to send email and push notification for a single appointment row
const sendReminderForAppointment = async (row) => {
    const { email, parent_name, expo_push_token, clinic_name, appointment_date, start_time, child_name, child_dob } = row;
    const dateStr = new Date(appointment_date).toLocaleDateString();
    const timeStr = start_time;
    let childDetailsHTML = '';
    if (child_name) {
        let ageText = '';
        if (child_dob) {
            const birthDate = new Date(child_dob);
            const today = new Date();
            let years = today.getFullYear() - birthDate.getFullYear();
            let months = today.getMonth() - birthDate.getMonth();
            if (months < 0 || (months === 0 && today.getDate() < birthDate.getDate())) {
                years--;
                months += 12;
            }
            if (today.getDate() < birthDate.getDate()) {
                months--;
                if (months < 0) {
                    months += 12;
                }
            }
            ageText = years === 0 ? ` (${months} months)` : ` (${years} years, ${months} months)`;
        }
        childDetailsHTML = `
      <p style="margin: 0 0 10px 0; color: #334155; font-size: 16px;">
        <strong style="color: #64748b; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 4px;">Patient (Child)</strong> 
        ${child_name}${ageText}
      </p>
    `;
    }
    const title = 'Clinic Appointment Reminder';
    const body = `Hi ${parent_name}, you have an appointment at ${clinic_name} on ${dateStr} at ${timeStr}.`;
    const html = `
    <!DOCTYPE html>
    <html>
    <body style="margin: 0; padding: 0; background-color: #f4f7f6; font-family: 'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif;">
      <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #0ba360 0%, #3cba92 100%); padding: 30px 20px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600; letter-spacing: 1px;">CareMate</h1>
          <p style="color: #e0f2ec; margin: 10px 0 0 0; font-size: 16px;">Appointment Reminder</p>
        </div>
        
        <!-- Body -->
        <div style="padding: 40px 30px;">
          <h2 style="color: #2c3e50; font-size: 20px; margin-top: 0;">Hi ${parent_name},</h2>
          <p style="color: #596a7a; font-size: 16px; line-height: 1.6;">This is a friendly reminder that you have an upcoming clinic appointment. Please find the details below:</p>
          
          <!-- Details Card -->
          <div style="background-color: #f8fafc; border-left: 4px solid #0ba360; border-radius: 4px; padding: 20px; margin: 30px 0;">
            ${childDetailsHTML}
            <p style="margin: 0 0 10px 0; color: #334155; font-size: 16px;">
              <strong style="color: #64748b; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 4px;">Clinic</strong> 
              ${clinic_name}
            </p>
            <p style="margin: 0 0 10px 0; color: #334155; font-size: 16px;">
              <strong style="color: #64748b; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 4px;">Date</strong> 
              ${dateStr}
            </p>
            <p style="margin: 0; color: #334155; font-size: 16px;">
              <strong style="color: #64748b; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 4px;">Time</strong> 
              ${timeStr}
            </p>
          </div>
          
          <p style="color: #596a7a; font-size: 16px; line-height: 1.6;">Please try to arrive 10 minutes early. We look forward to seeing you!</p>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #edf2f7;">
          <p style="color: #94a3b8; font-size: 14px; margin: 0;">&copy; ${new Date().getFullYear()} CareMate. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
    // Send Email
    if (email) {
        await (0, notificationService_1.sendEmailReminder)(email, title, html);
    }
    // Send Push Notification
    if (expo_push_token) {
        await (0, notificationService_1.sendPushNotification)(expo_push_token, title, body, { appointmentId: row.id });
    }
};
// Function to process reminders for a specific interval
const processReminders = async (intervalDays) => {
    try {
        const query = `
      SELECT a.id, a.appointment_date, a.start_time, c.name AS clinic_name, 
             u.email, p.full_name AS parent_name, p.expo_push_token,
             ch.full_name AS child_name, ch.dob AS child_dob
      FROM appointments a
      JOIN clinics c ON c.id = a.clinic_id
      JOIN app_users u ON u.id::text = a.parent_id
      JOIN profiles p ON p.id::text = a.parent_id
      LEFT JOIN children ch ON ch.id::text = a.child_id
      WHERE a.status = 'booked' 
        AND a.appointment_date = (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Colombo')::date + INTERVAL '${intervalDays} days'
    `;
        const result = await db_1.default.query(query);
        for (const row of result.rows) {
            await sendReminderForAppointment(row);
        }
    }
    catch (error) {
        console.error(`Error processing ${intervalDays}-day reminders:`, error);
    }
};
// Function to process ALL future reminders regardless of interval (for manual trigger)
const runAllFutureReminders = async () => {
    console.log('Manually triggering all future reminders...');
    try {
        const query = `
      SELECT a.id, a.appointment_date, a.start_time, c.name AS clinic_name, 
             u.email, p.full_name AS parent_name, p.expo_push_token,
             ch.full_name AS child_name, ch.dob AS child_dob
      FROM appointments a
      JOIN clinics c ON c.id = a.clinic_id
      JOIN app_users u ON u.id::text = a.parent_id
      JOIN profiles p ON p.id::text = a.parent_id
      LEFT JOIN children ch ON ch.id::text = a.child_id
      WHERE a.status = 'booked' 
        AND a.appointment_date >= (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Colombo')::date
    `;
        const result = await db_1.default.query(query);
        console.log(`Found ${result.rows.length} future appointments to send reminders for.`);
        for (const row of result.rows) {
            await sendReminderForAppointment(row);
        }
        console.log('Manual reminder process completed.');
    }
    catch (error) {
        console.error('Error in runAllFutureReminders:', error);
    }
};
exports.runAllFutureReminders = runAllFutureReminders;
const runSingleReminder = async (appointmentId) => {
    console.log(`Manually triggering reminder for appointment ${appointmentId}...`);
    try {
        const query = `
      SELECT a.id, a.appointment_date, a.start_time, c.name AS clinic_name, 
             u.email, p.full_name AS parent_name, p.expo_push_token,
             ch.full_name AS child_name, ch.dob AS child_dob
      FROM appointments a
      JOIN clinics c ON c.id = a.clinic_id
      JOIN app_users u ON u.id::text = a.parent_id
      JOIN profiles p ON p.id::text = a.parent_id
      LEFT JOIN children ch ON ch.id::text = a.child_id
      WHERE a.id = $1
    `;
        const result = await db_1.default.query(query, [appointmentId]);
        if (result.rows.length === 0) {
            console.log(`No appointment found with ID ${appointmentId}`);
            return;
        }
        await sendReminderForAppointment(result.rows[0]);
        console.log(`Manual single reminder for ${appointmentId} sent.`);
    }
    catch (error) {
        console.error(`Error in runSingleReminder for ${appointmentId}:`, error);
    }
};
exports.runSingleReminder = runSingleReminder;
const runReminders = async () => {
    console.log('Running automated reminder process...');
    try {
        const settings = await db_1.default.query('SELECT days_before FROM notification_settings');
        const intervals = settings.rows.map(row => row.days_before);
        for (const interval of intervals) {
            console.log(`Processing reminders for ${interval} days before...`);
            await processReminders(interval);
        }
        console.log('Automated reminder process completed.');
    }
    catch (error) {
        console.error('Error in runReminders:', error);
    }
};
exports.runReminders = runReminders;
const initCronJobs = () => {
    // Run daily at 8:00 AM
    node_cron_1.default.schedule('0 8 * * *', async () => {
        console.log('Cron triggered: Running daily reminder cron job...');
        await (0, exports.runReminders)();
    }, {
        timezone: "Asia/Colombo"
    });
    console.log('Reminder cron jobs initialized.');
};
exports.initCronJobs = initCronJobs;
//# sourceMappingURL=reminderCron.js.map