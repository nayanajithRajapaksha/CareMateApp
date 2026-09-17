import nodemailer from 'nodemailer';
import { Expo } from 'expo-server-sdk';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Expo SDK
const expo = new Expo();

// Initialize Nodemailer Transport
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendEmailReminder = async (to: string, subject: string, html: string): Promise<boolean> => {
  if (!process.env.SMTP_USER) {
    console.warn('SMTP credentials not configured. Skipping email to', to);
    return false;
  }
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || '"CareMate" <noreply@caremate.com>',
      to,
      subject,
      html,
    });
    console.log(`Email sent successfully to ${to}`);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
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
