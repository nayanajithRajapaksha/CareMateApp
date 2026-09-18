import { Router } from 'express';
import { getNotificationSettings, updateNotificationSettings, triggerReminders, triggerSingleReminder } from '../controllers/notificationController';
import { verifyToken, requireRole } from '../middleware/authMiddleware';

const router = Router();

router.use(verifyToken);

router.get('/settings', requireRole(['admin', 'moh']), getNotificationSettings);
router.put('/settings', requireRole(['admin', 'moh']), updateNotificationSettings);
router.post('/trigger', requireRole(['admin', 'moh']), triggerReminders);
router.post('/trigger-single', requireRole(['admin', 'moh', 'midwife']), triggerSingleReminder);

export default router;
