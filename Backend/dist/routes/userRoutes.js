"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = require("../controllers/userController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
router.use(authMiddleware_1.verifyToken);
router.get('/profile', userController_1.getProfile);
router.put('/profile', userController_1.updateProfile);
router.put('/push-token', userController_1.updatePushToken);
router.get('/notifications', userController_1.getUserNotifications);
router.put('/notifications/:id/read', userController_1.markNotificationAsRead);
router.get('/all', (0, authMiddleware_1.requireRole)('admin'), userController_1.getAllUsers);
const multer_1 = __importDefault(require("multer"));
const supabase_1 = require("../config/supabase");
const db_1 = __importDefault(require("../config/db"));
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});
router.post('/profile-pic', upload.single('profile_pic'), async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        if (!req.file) {
            res.status(400).json({ error: 'No image provided' });
            return;
        }
        const file = req.file;
        const bucketName = await (0, supabase_1.ensureAvatarsBucket)();
        // Determine appropriate file extension based on mimetype or original name
        let ext = 'jpg';
        if (file.mimetype) {
            if (file.mimetype.includes('png'))
                ext = 'png';
            else if (file.mimetype.includes('webp'))
                ext = 'webp';
            else if (file.mimetype.includes('gif'))
                ext = 'gif';
            else if (file.mimetype.includes('jpeg') || file.mimetype.includes('jpg'))
                ext = 'jpg';
        }
        else if (file.originalname && file.originalname.includes('.')) {
            ext = file.originalname.split('.').pop() || 'jpg';
        }
        const fileName = `caremate_profiles/user_${userId}_${Date.now()}.${ext}`;
        const { data, error } = await (0, supabase_1.getSupabase)().storage
            .from(bucketName)
            .upload(fileName, file.buffer, {
            contentType: file.mimetype || 'image/jpeg',
            upsert: true,
        });
        if (error) {
            console.error('Supabase upload error:', error);
            res.status(500).json({ error: 'Failed to upload profile picture to storage' });
            return;
        }
        const { data: publicUrlData } = (0, supabase_1.getSupabase)().storage
            .from(bucketName)
            .getPublicUrl(fileName);
        const imageUrl = publicUrlData.publicUrl;
        await db_1.default.query('UPDATE profiles SET profile_pic_url = $1 WHERE id = $2', [imageUrl, userId]);
        res.json({ message: 'Profile picture updated successfully', profile_pic_url: imageUrl });
    }
    catch (error) {
        console.error('Error uploading profile picture:', error);
        res.status(500).json({ error: 'Failed to upload profile picture' });
    }
});
exports.default = router;
//# sourceMappingURL=userRoutes.js.map