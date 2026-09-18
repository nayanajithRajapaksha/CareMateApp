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
