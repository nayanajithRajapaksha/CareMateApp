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
const upload = (0, multer_1.default)({ storage });
router.post('/profile-pic', upload.single('profile_pic'), async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!req.file) {
            res.status(400).json({ error: 'No image provided' });
            return;
        }
        const file = req.file;
        // ensure originalname is sanitized somewhat and has a predictable format
        const sanitizedName = file.originalname.split('.')[0].replace(/[^a-zA-Z0-9]/g, '_');
        const fileName = `caremate_profiles/${Date.now()}-${sanitizedName}.png`;
        const { data, error } = await (0, supabase_1.getSupabase)().storage
            .from('avatars')
            .upload(fileName, file.buffer, {
            contentType: file.mimetype,
            upsert: true,
        });
        if (error) {
            console.error('Supabase upload error:', error);
            res.status(500).json({ error: 'Failed to upload profile picture to storage' });
            return;
        }
        const { data: publicUrlData } = (0, supabase_1.getSupabase)().storage
            .from('avatars')
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