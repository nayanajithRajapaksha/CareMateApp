import { Router } from 'express';
import { 
  getUnassignedPHMs, 
  getAssignedPHMs, 
  assignHospital, 
  unassignHospital, 
  createPHMByMOH, 
  getParents, 
  assignParentHospital 
} from '../controllers/staffController';
import { verifyToken, requireRole, requireAnyRole } from '../middleware/authMiddleware';

const router = Router();

router.use(verifyToken);

router.get('/unassigned-phms', requireRole('moh'), getUnassignedPHMs);
router.get('/assigned-phms', requireRole('moh'), getAssignedPHMs);
router.post('/assign-hospital', requireAnyRole(['moh', 'phm', 'midwife']), assignHospital);
router.post('/unassign-hospital', requireRole('moh'), unassignHospital);

router.post('/create-phm', requireRole('moh'), createPHMByMOH);
router.get('/parents', requireAnyRole(['moh', 'phm', 'midwife']), getParents);
router.post('/assign-parent', requireAnyRole(['moh', 'phm', 'midwife']), assignParentHospital);

export default router;


