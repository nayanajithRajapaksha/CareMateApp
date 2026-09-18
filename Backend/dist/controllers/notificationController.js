"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.triggerSingleReminder = exports.triggerReminders = exports.updateNotificationSettings = exports.getNotificationSettings = void 0;
const db_1 = __importDefault(require("../config/db"));
const reminderCron_1 = require("../jobs/reminderCron");
const getNotificationSettings = async (req, res) => {
    try {
        const result = await db_1.default.query('SELECT id, days_before FROM notification_settings ORDER BY days_before ASC');
        res.status(200).json({ settings: result.rows });
    }
    catch (error) {
        console.error('Error fetching notification settings:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getNotificationSettings = getNotificationSettings;
const updateNotificationSettings = async (req, res) => {
    const { days } = req.body;
    if (!Array.isArray(days)) {
        res.status(400).json({ error: 'Expected an array of days (numbers).' });
        return;
    }
    const client = await db_1.default.connect();
    try {
        await client.query('BEGIN');
        await client.query('TRUNCATE TABLE notification_settings');
        for (const day of days) {
            if (typeof day === 'number' && day > 0) {
                await client.query('INSERT INTO notification_settings (days_before) VALUES ($1) ON CONFLICT DO NOTHING', [day]);
            }
        }
        await client.query('COMMIT');
        const result = await client.query('SELECT id, days_before FROM notification_settings ORDER BY days_before ASC');
        res.status(200).json({ settings: result.rows });
    }
    catch (error) {
        await client.query('ROLLBACK');
        console.error('Error updating notification settings:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
    finally {
        client.release();
    }
};
exports.updateNotificationSettings = updateNotificationSettings;
const triggerReminders = async (req, res) => {
    try {
        // Run the reminder logic asynchronously so we don't block the response for too long
        (0, reminderCron_1.runAllFutureReminders)().catch(error => console.error('Error in manual reminder trigger:', error));
        res.status(200).json({ message: 'Reminder process started successfully.' });
    }
    catch (error) {
        console.error('Error triggering reminders:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.triggerReminders = triggerReminders;
const triggerSingleReminder = async (req, res) => {
    const { appointmentId } = req.body;
    if (!appointmentId) {
        res.status(400).json({ error: 'Appointment ID is required.' });
        return;
    }
    try {
        // Permission check for midwives (phm)
        if (req.user?.role === 'phm' || req.user?.role === 'midwife') {
            const appointmentRes = await db_1.default.query(`SELECT c.name as clinic_name 
         FROM appointments a 
         JOIN clinics c ON a.clinic_id = c.id 
         WHERE a.id = $1`, [appointmentId]);
            if (appointmentRes.rows.length === 0) {
                res.status(404).json({ error: 'Appointment not found.' });
                return;
            }
            const clinicName = appointmentRes.rows[0].clinic_name;
            const midwifeRes = await db_1.default.query('SELECT hospital FROM profiles WHERE id = $1', [req.user.id]);
            const assignedHospitals = midwifeRes.rows[0]?.hospital || '';
            if (!assignedHospitals.includes(clinicName)) {
                res.status(403).json({ error: 'You can only notify parents assigned to your hospital.' });
                return;
            }
        }
        const { runSingleReminder } = await Promise.resolve().then(() => __importStar(require('../jobs/reminderCron')));
        runSingleReminder(appointmentId).catch(error => console.error(`Error triggering single reminder for ${appointmentId}:`, error));
        res.status(200).json({ message: 'Single reminder process started successfully.' });
    }
    catch (error) {
        console.error('Error triggering single reminder:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.triggerSingleReminder = triggerSingleReminder;
//# sourceMappingURL=notificationController.js.map