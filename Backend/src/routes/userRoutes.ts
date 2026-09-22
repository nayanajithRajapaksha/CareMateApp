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
import { getSupabase, ensureAvatarsBucket } from '../config/supabase';
import pool from '../config/db';

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

router.post('/profile-pic', upload.single('profile_pic'), async (req: any, res: any): Promise<void> => {
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
    const bucketName = await ensureAvatarsBucket();

    // Determine appropriate file extension based on mimetype or original name
    let ext = 'jpg';
    if (file.mimetype) {
      if (file.mimetype.includes('png')) ext = 'png';
      else if (file.mimetype.includes('webp')) ext = 'webp';
      else if (file.mimetype.includes('gif')) ext = 'gif';
      else if (file.mimetype.includes('jpeg') || file.mimetype.includes('jpg')) ext = 'jpg';
    } else if (file.originalname && file.originalname.includes('.')) {
      ext = file.originalname.split('.').pop() || 'jpg';
    }

    const fileName = `caremate_profiles/user_${userId}_${Date.now()}.${ext}`;

    const { data, error } = await getSupabase().storage
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

    const { data: publicUrlData } = getSupabase().storage
      .from(bucketName)
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
