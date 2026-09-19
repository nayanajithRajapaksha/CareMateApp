import { Router } from 'express';
import { getProfile, updateProfile, getAllUsers, updatePushToken, getUserNotifications, markNotificationAsRead } from '../controllers/userController';
import { verifyToken, requireRole } from '../middleware/authMiddleware';

const router = Router();

router.use(verifyToken);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.put('/push-token', updatePushToken);
router.get('/notifications', getUserNotifications);
router.put('/notifications/:id/read', markNotificationAsRead);
router.get('/all', requireRole('admin'), getAllUsers);

import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import pool from '../config/db';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
  api_key: process.env.CLOUDINARY_API_KEY || '',
  api_secret: process.env.CLOUDINARY_API_SECRET || ''
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: 'caremate_profiles',
      format: 'png',
      public_id: `${Date.now()}-${file.originalname.split('.')[0]}`
    };
  }
});

const upload = multer({ storage });

router.post('/profile-pic', upload.single('profile_pic'), async (req: any, res: any): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!req.file) {
      res.status(400).json({ error: 'No image provided' });
      return;
    }
    const imageUrl = req.file.path;

    await pool.query('UPDATE profiles SET profile_pic_url = $1 WHERE id = $2', [imageUrl, userId]);
    res.json({ message: 'Profile picture updated successfully', profile_pic_url: imageUrl });
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    res.status(500).json({ error: 'Failed to upload profile picture' });
  }
});

export default router;
