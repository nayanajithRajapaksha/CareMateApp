// (Nodemailer removed - using EmailJS)
import { Expo } from 'expo-server-sdk';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Expo SDK
const expo = new Expo();

export const sendEmailReminder = async (to: string, subject: string, html: string): Promise<boolean> => {
  const serviceId = process.env.EMAILJS_SERVICE_ID;
  const templateId = process.env.EMAILJS_TEMPLATE_ID;
  const publicKey = process.env.EMAILJS_PUBLIC_KEY;
  const privateKey = process.env.EMAILJS_PRIVATE_KEY;

  if (!serviceId || !templateId || !publicKey || !privateKey) {
    console.warn('EmailJS credentials not fully configured. Skipping email to', to);
    return false;
  }

  try {
    const payload = {
      service_id: serviceId,
      template_id: templateId,
      user_id: publicKey,
      accessToken: privateKey,
      template_params: {
        to_email: to,
        subject: subject,
        message: html,
      }
    };

    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      console.log(`Email sent successfully to ${to} via EmailJS`);
      return true;
    } else {
      const errorText = await response.text();
      console.error('EmailJS Error:', errorText);
      return false;
    }
  } catch (error) {
    console.error('Error sending email via EmailJS:', error);
    return false;
  }
};

export const sendPushNotification = async (pushToken: string, title: string, body: string, data: any = {}): Promise<boolean> => {
  if (!Expo.isExpoPushToken(pushToken)) {
    console.error(`Push token ${pushToken} is not a valid Expo push token`);
    return false;
  }

  const messages = [{
    to: pushToken,
    sound: 'default' as const,
    title,
    body,
    data,
  }];

  try {
    const chunks = expo.chunkPushNotifications(messages);
    const tickets = [];
    for (const chunk of chunks) {
      const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      tickets.push(...ticketChunk);
    }
    console.log('Push notification sent:', tickets);
    return true;
  } catch (error) {
    console.error('Error sending push notification:', error);
    return false;
  }
};
