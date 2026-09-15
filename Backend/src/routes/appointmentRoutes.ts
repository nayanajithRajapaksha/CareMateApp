import { Router } from 'express';
import {
  createAppointment,
  getAvailability,
  getMyAppointments,
  getMyAvailability,
  getStaffAppointments,
  updateMyAvailability,
  cancelAppointment,
} from '../controllers/appointmentController';
import { requireRole, verifyToken } from '../middleware/authMiddleware';

const router = Router();

router.get('/availability', getAvailability);
router.use(verifyToken);
router.post('/', requireRole('parent'), createAppointment);
router.get('/mine', requireRole('parent'), getMyAppointments);
router.delete('/:id', requireRole('parent'), cancelAppointment);
router.get('/my-availability', requireRole(['phm', 'midwife']), getMyAvailability);
router.put('/my-availability', requireRole(['phm', 'midwife']), updateMyAvailability);
router.get('/staff', requireRole(['phm', 'midwife']), getStaffAppointments);

export default router;
