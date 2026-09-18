import { Router } from 'express';
import { getNotificationSettings, updateNotificationSettings, triggerReminders, triggerSingleReminder } from '../controllers/notificationController';
import { verifyToken, requireRole } from '../middleware/authMiddleware';

const router = Router();

router.use(verifyToken);
router.use(requireRole(['admin', 'moh'])); // Admins and MOH can trigger notifications

router.get('/settings', getNotificationSettings);
router.put('/settings', updateNotificationSettings);
router.post('/trigger', triggerReminders);
router.post('/trigger-single', triggerSingleReminder);

export default router;
