import { Router } from 'express';
import { verifyToken, requireAnyRole } from '../middleware/authMiddleware';
import { getVaccines, addVaccine, getChildVaccinations, markVaccineAdministered } from '../controllers/vaccineController';

const router = Router();

// Apply auth middleware to all routes
router.use(verifyToken);

// Master schedule (Admin/MOH)
router.get('/', getVaccines);
router.post('/', requireAnyRole(['admin', 'moh', 'supervisor']), addVaccine);

// Child specific timeline
router.get('/child/:id', getChildVaccinations);
router.post('/child/:id', requireAnyRole(['phm', 'midwife']), markVaccineAdministered);

export default router;
