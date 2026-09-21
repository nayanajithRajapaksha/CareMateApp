"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middleware/authMiddleware");
const childrenController_1 = require("../controllers/childrenController");
const multer_1 = __importDefault(require("multer"));
const supabase_1 = require("../config/supabase");
const db_1 = __importDefault(require("../config/db"));
const storage = multer_1.default.memoryStorage();
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
        const child = await db_1.default.query('SELECT id FROM children WHERE id = $1 AND parent_id = $2', [childId, parentId]);
        if (child.rows.length === 0) {
            res.status(404).json({ error: 'Child not found or not authorized' });
            return;
        }
        const file = req.file;
        const sanitizedName = file.originalname.split('.')[0].replace(/[^a-zA-Z0-9]/g, '_');
        const fileName = `caremate_child_profiles/${Date.now()}-${sanitizedName}.png`;
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