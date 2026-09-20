"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendPushNotification = exports.sendEmailReminder = void 0;
// (Nodemailer removed - using EmailJS)
const expo_server_sdk_1 = require("expo-server-sdk");
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = __importDefault(require("../config/db"));
dotenv_1.default.config();
// Initialize Expo SDK
const expo = new expo_server_sdk_1.Expo();
const sendEmailReminder = async (to, subject, html) => {
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
        }
        else {
            const errorText = await response.text();
            console.error('EmailJS Error:', errorText);
            return false;
        }
    }
    catch (error) {
        console.error('Error sending email via EmailJS:', error);
        return false;
    }
};
exports.sendEmailReminder = sendEmailReminder;
const sendPushNotification = async (userId, pushToken, title, body, data = {}) => {
    if (userId) {
        try {
            await db_1.default.query('INSERT INTO app_notifications (user_id, title, message) VALUES ($1, $2, $3)', [userId, title, body]);
        }
        catch (dbError) {
            console.error('Failed to insert notification into DB:', dbError);
        }
    }
    if (!pushToken || !expo_server_sdk_1.Expo.isExpoPushToken(pushToken)) {
        console.error(`Push token ${pushToken} is missing or not a valid Expo push token`);
        return false;
    }
    const messages = [{
            to: pushToken,
            sound: 'default',
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
    }
    catch (error) {
        console.error('Error sending push notification:', error);
        return false;
    }
};
exports.sendPushNotification = sendPushNotification;
//# sourceMappingURL=notificationService.js.map