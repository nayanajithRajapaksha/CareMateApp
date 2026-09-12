import { Router } from 'express';
import { getUnassignedPHMs, assignHospital } from '../controllers/staffController';
import { verifyToken, requireRole } from '../middleware/authMiddleware';

const router = Router();

router.use(verifyToken);

router.get('/unassigned-phms', requireRole('moh'), getUnassignedPHMs);
router.post('/assign-hospital', requireRole('moh'), assignHospital);

export default router;
