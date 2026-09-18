"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middleware/authMiddleware");
const childrenController_1 = require("../controllers/childrenController");
const multer_1 = __importDefault(require("multer"));
const multer_storage_cloudinary_1 = require("multer-storage-cloudinary");
const cloudinary_1 = require("cloudinary");
const db_1 = __importDefault(require("../config/db"));
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});
const storage = new multer_storage_cloudinary_1.CloudinaryStorage({
    cloudinary: cloudinary_1.v2,
    params: async (req, file) => {
        return {
            folder: 'caremate_child_profiles',
            format: 'png',
            public_id: `${Date.now()}-${file.originalname.split('.')[0]}`
        };
    }
});
const upload = (0, multer_1.default)({ storage });
const router = (0, express_1.Router)();
// Apply auth middleware to all routes in this router
router.use(authMiddleware_1.verifyToken);
router.post('/register', (0, authMiddleware_1.requireRole)('parent'), childrenController_1.registerChild);
router.get('/', (0, authMiddleware_1.requireRole)('parent'), childrenController_1.getChildren);
router.get('/all', (0, authMiddleware_1.requireRole)('phm'), childrenController_1.getAllChildrenController);
router.put('/:id', (0, authMiddleware_1.requireRole)(['parent', 'phm']), childrenController_1.updateChild);
router.post('/:id/profile-pic', (0, authMiddleware_1.requireRole)('parent'), upload.single('profile_pic'), async (req, res) => {
    try {
        const childId = req.params.id;
        const parentId = req.user?.id;
        if (!req.file) {
            res.status(400).json({ error: 'No image provided' });
            return;
        }
        const imageUrl = req.file.path;
        const child = await db_1.default.query('SELECT id FROM children WHERE id = $1 AND parent_id = $2', [childId, parentId]);
        if (child.rows.length === 0) {
            res.status(404).json({ error: 'Child not found or not authorized' });
            return;
        }
        await db_1.default.query('UPDATE children SET profile_pic_url = $1 WHERE id = $2', [imageUrl, childId]);
        res.json({ message: 'Child profile picture updated successfully', profile_pic_url: imageUrl });
    }
    catch (error) {
        console.error('Error uploading child profile picture:', error);
        res.status(500).json({ error: 'Failed to upload profile picture' });
    }
});
exports.default = router;
//# sourceMappingURL=childrenRoutes.js.map