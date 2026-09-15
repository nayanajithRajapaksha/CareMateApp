import { Router } from 'express';
import { getProfile, updateProfile, getAllUsers } from '../controllers/userController';
import { verifyToken, requireRole } from '../middleware/authMiddleware';

const router = Router();

router.use(verifyToken);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.get('/all', requireRole('admin'), getAllUsers);

export default router;
