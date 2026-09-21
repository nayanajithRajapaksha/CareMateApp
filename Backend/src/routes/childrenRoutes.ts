import { Router } from 'express';
import { verifyToken, requireRole } from '../middleware/authMiddleware';
import { registerChild, getChildren, updateChild, getAllChildrenController } from '../controllers/childrenController';
import multer from 'multer';
import { getSupabase } from '../config/supabase';
import pool from '../config/db';

const storage = multer.memoryStorage();
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

    const child = await pool.query('SELECT id FROM children WHERE id = $1 AND parent_id = $2', [childId, parentId]);
    if (child.rows.length === 0) {
      res.status(404).json({ error: 'Child not found or not authorized' });
      return;
    }

    const file = req.file;
    const sanitizedName = file.originalname.split('.')[0].replace(/[^a-zA-Z0-9]/g, '_');
    const fileName = `caremate_child_profiles/${Date.now()}-${sanitizedName}.png`;

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

    await pool.query('UPDATE children SET profile_pic_url = $1 WHERE id = $2', [imageUrl, childId]);
    res.json({ message: 'Child profile picture updated successfully', profile_pic_url: imageUrl });
  } catch (error) {
    console.error('Error uploading child profile picture:', error);
    res.status(500).json({ error: 'Failed to upload profile picture' });
  }
});

export default router;
