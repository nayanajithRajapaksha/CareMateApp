import { Router } from 'express';
import { getNotificationSettings, updateNotificationSettings, triggerReminders } from '../controllers/notificationController';
import { verifyToken, requireRole } from '../middleware/authMiddleware';

const router = Router();

router.use(verifyToken);
router.use(requireRole('admin')); // Only admins can manage notifications

router.get('/settings', getNotificationSettings);
router.put('/settings', updateNotificationSettings);
router.post('/trigger', triggerReminders);

export default router;
