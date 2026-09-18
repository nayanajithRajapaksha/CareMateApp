import { Router } from 'express';
import { verifyToken, requireRole } from '../middleware/authMiddleware';
import { registerChild, getChildren, updateChild, getAllChildrenController } from '../controllers/childrenController';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { v2 as cloudinary } from 'cloudinary';
import pool from '../config/db';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: 'caremate_child_profiles',
      format: 'png',
      public_id: `${Date.now()}-${file.originalname.split('.')[0]}`
    };
  }
});

const upload = multer({ storage });

const router = Router();

// Apply auth middleware to all routes in this router
router.use(verifyToken);

router.post('/register', requireRole('parent'), registerChild);
router.get('/', requireRole('parent'), getChildren);
router.get('/all', requireRole('phm'), getAllChildrenController);
router.put('/:id', requireRole(['parent', 'phm']), updateChild);

router.post('/:id/profile-pic', requireRole('parent'), upload.single('profile_pic'), async (req: any, res: any): Promise<void> => {
  try {
    const childId = req.params.id;
    const parentId = req.user?.id;
    if (!req.file) {
      res.status(400).json({ error: 'No image provided' });
      return;
    }
    const imageUrl = req.file.path;

    const child = await pool.query('SELECT id FROM children WHERE id = $1 AND parent_id = $2', [childId, parentId]);
    if (child.rows.length === 0) {
      res.status(404).json({ error: 'Child not found or not authorized' });
      return;
    }

    await pool.query('UPDATE children SET profile_pic_url = $1 WHERE id = $2', [imageUrl, childId]);
    res.json({ message: 'Child profile picture updated successfully', profile_pic_url: imageUrl });
  } catch (error) {
    console.error('Error uploading child profile picture:', error);
    res.status(500).json({ error: 'Failed to upload profile picture' });
  }
});

export default router;
