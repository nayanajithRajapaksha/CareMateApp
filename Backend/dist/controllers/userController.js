"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.markNotificationAsRead = exports.getUserNotifications = exports.updatePushToken = exports.getAllUsers = exports.updateProfile = exports.getProfile = void 0;
const db_1 = __importDefault(require("../config/db"));
const getProfile = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const result = await db_1.default.query(`SELECT u.email, p.full_name, p.contact_number, p.role, p.hospital, p.profile_pic_url
       FROM app_users u
       JOIN profiles p ON u.id = p.id
       WHERE u.id = $1`, [userId]);
        if (result.rows.length === 0) {
            res.status(404).json({ error: 'User profile not found' });
            return;
        }
        res.status(200).json({ profile: result.rows[0] });
    }
    catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getProfile = getProfile;
const updateProfile = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const { full_name, contact_number } = req.body;
        if (!full_name) {
            res.status(400).json({ error: 'Full name is required' });
            return;
        }
        const result = await db_1.default.query(`UPDATE profiles
       SET full_name = $1,
           contact_number = COALESCE($2, contact_number)
       WHERE id = $3
       RETURNING full_name, contact_number, role, hospital, profile_pic_url`, [full_name, contact_number ?? null, userId]);
        if (result.rows.length === 0) {
            res.status(404).json({ error: 'User profile not found' });
            return;
        }
        res.status(200).json({ message: 'Profile updated successfully', profile: result.rows[0] });
    }
    catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.updateProfile = updateProfile;
const getAllUsers = async (req, res) => {
    try {
        const result = await db_1.default.query(`SELECT p.id, u.email, p.full_name, p.contact_number, p.role, p.hospital, p.profile_pic_url, p.created_at
       FROM profiles p
       JOIN app_users u ON p.id = u.id
       ORDER BY p.created_at DESC`);
        res.status(200).json({ users: result.rows });
    }
    catch (error) {
        console.error('Error fetching all users:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getAllUsers = getAllUsers;
const updatePushToken = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const { expo_push_token } = req.body;
        if (!expo_push_token) {
            res.status(400).json({ error: 'expo_push_token is required' });
            return;
        }
        await db_1.default.query(`UPDATE profiles SET expo_push_token = $1 WHERE id = $2`, [expo_push_token, userId]);
        res.status(200).json({ message: 'Push token updated successfully' });
    }
    catch (error) {
        console.error('Error updating push token:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.updatePushToken = updatePushToken;
const getUserNotifications = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const result = await db_1.default.query(`SELECT id, title, message, type, is_read, created_at 
       FROM app_notifications 
       WHERE user_id = $1 
       ORDER BY created_at DESC`, [userId]);
        res.status(200).json({ notifications: result.rows });
    }
    catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getUserNotifications = getUserNotifications;
const markNotificationAsRead = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { id } = req.params;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        await db_1.default.query(`UPDATE app_notifications SET is_read = true WHERE id = $1 AND user_id = $2`, [id, userId]);
        res.status(200).json({ message: 'Notification marked as read' });
    }
    catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.markNotificationAsRead = markNotificationAsRead;
//# sourceMappingURL=userController.js.map