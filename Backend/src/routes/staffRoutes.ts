import { Router } from 'express';
import { getUnassignedPHMs, getAssignedPHMs, assignHospital, unassignHospital } from '../controllers/staffController';
import { verifyToken, requireRole } from '../middleware/authMiddleware';

const router = Router();

router.use(verifyToken);

router.get('/unassigned-phms', requireRole('moh'), getUnassignedPHMs);
router.get('/assigned-phms', requireRole('moh'), getAssignedPHMs);
router.post('/assign-hospital', requireRole('moh'), assignHospital);
router.post('/unassign-hospital', requireRole('moh'), unassignHospital);

export default router;
