import cron from 'node-cron';
import pool from '../config/db';
import { sendEmailReminder, sendPushNotification } from '../services/notificationService';

// Function to process reminders for a specific interval
const processReminders = async (intervalDays: number) => {
  try {
    const query = `
      SELECT a.id, a.appointment_date, a.start_time, c.name AS clinic_name, 
             u.email, p.full_name AS parent_name, p.expo_push_token
      FROM appointments a
      JOIN clinics c ON c.id = a.clinic_id
      JOIN app_users u ON u.id::text = a.parent_id
      JOIN profiles p ON p.id::text = a.parent_id
      WHERE a.status = 'booked' 
        AND a.appointment_date = CURRENT_DATE + INTERVAL '${intervalDays} days'
    `;

    const result = await pool.query(query);

    for (const row of result.rows) {
      const { email, parent_name, expo_push_token, clinic_name, appointment_date, start_time } = row;
      const dateStr = new Date(appointment_date).toLocaleDateString();
      const timeStr = start_time;

      const title = 'Clinic Appointment Reminder';
      const body = `Hi ${parent_name}, you have an appointment at ${clinic_name} on ${dateStr} at ${timeStr}.`;
      
      const html = `
        <div style="font-family: sans-serif; color: #333;">
          <h2>Appointment Reminder</h2>
          <p>Hi ${parent_name},</p>
          <p>This is a reminder that you have a clinic appointment scheduled.</p>
          <ul>
            <li><strong>Clinic:</strong> ${clinic_name}</li>
            <li><strong>Date:</strong> ${dateStr}</li>
            <li><strong>Time:</strong> ${timeStr}</li>
          </ul>
          <p>Thank you,<br/>CareMate Team</p>
        </div>
      `;

      // Send Email
      if (email) {
        await sendEmailReminder(email, title, html);
      }

      // Send Push Notification
      if (expo_push_token) {
        await sendPushNotification(expo_push_token, title, body, { appointmentId: row.id });
      }
    }
  } catch (error) {
    console.error(`Error processing ${intervalDays}-day reminders:`, error);
  }
};

export const runReminders = async () => {
  console.log('Running reminder process...');
  try {
    const settings = await pool.query('SELECT days_before FROM notification_settings');
    const intervals = settings.rows.map(row => row.days_before);
    
    for (const interval of intervals) {
      console.log(`Processing reminders for ${interval} days before...`);
      await processReminders(interval);
    }
    console.log('Reminder process completed.');
  } catch (error) {
    console.error('Error in runReminders:', error);
  }
};

export const initCronJobs = () => {
  // Run daily at 8:00 AM
  cron.schedule('0 8 * * *', async () => {
    console.log('Cron triggered: Running daily reminder cron job...');
    await runReminders();
  }, {
    timezone: "Asia/Colombo" // Adjust based on user's timezone if needed
  });
  
  console.log('Reminder cron jobs initialized.');
};
