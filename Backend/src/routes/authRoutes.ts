import { Router } from 'express';
import { register, login, changePassword, forgotPassword, resetPassword } from '../controllers/authController';
import { registerPHM, registerMOH } from '../controllers/staffAuthController';
import { verifyToken, requireRole } from '../middleware/authMiddleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/change-password', verifyToken, changePassword);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Staff endpoints
router.post('/register-phm', registerPHM);
router.post('/register-moh', verifyToken, requireRole('admin'), registerMOH);

export default router;
