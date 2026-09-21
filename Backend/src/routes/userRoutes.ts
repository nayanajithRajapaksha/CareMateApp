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
import { getSupabase } from '../config/supabase';
import pool from '../config/db';

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/profile-pic', upload.single('profile_pic'), async (req: any, res: any): Promise<void> => {
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

    const { data, error } = await getSupabase().storage
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

    const { data: publicUrlData } = getSupabase().storage
      .from('avatars')
      .getPublicUrl(fileName);

    const imageUrl = publicUrlData.publicUrl;

    await pool.query('UPDATE profiles SET profile_pic_url = $1 WHERE id = $2', [imageUrl, userId]);
    res.json({ message: 'Profile picture updated successfully', profile_pic_url: imageUrl });
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    res.status(500).json({ error: 'Failed to upload profile picture' });
  }
});

export default router;
