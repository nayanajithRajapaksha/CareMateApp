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
router.get('/all', (0, authMiddleware_1.requireRole)('admin'), userController_1.getAllUsers);
const multer_1 = __importDefault(require("multer"));
const cloudinary_1 = require("cloudinary");
const multer_storage_cloudinary_1 = require("multer-storage-cloudinary");
const db_1 = __importDefault(require("../config/db"));
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
    api_key: process.env.CLOUDINARY_API_KEY || '',
    api_secret: process.env.CLOUDINARY_API_SECRET || ''
});
const storage = new multer_storage_cloudinary_1.CloudinaryStorage({
    cloudinary: cloudinary_1.v2,
    params: async (req, file) => {
        return {
            folder: 'caremate_profiles',
            format: 'png',
            public_id: `${Date.now()}-${file.originalname.split('.')[0]}`
        };
    }
});
const upload = (0, multer_1.default)({ storage });
router.post('/profile-pic', upload.single('profile_pic'), async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!req.file) {
            res.status(400).json({ error: 'No image provided' });
            return;
        }
        const imageUrl = req.file.path;
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