import { Router } from 'express';
import { getProfile, updateProfile } from '../controllers/userController';
import { verifyToken } from '../middleware/authMiddleware';

const router = Router();

router.use(verifyToken);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);

export default router;
