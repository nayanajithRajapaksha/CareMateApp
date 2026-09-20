import { Router } from 'express';
import { verifyToken, requireAnyRole } from '../middleware/authMiddleware';
import { getVaccines, addVaccine, getChildVaccinations, markVaccineAdministered, updateVaccine, removeVaccineRecord, sendOverdueWarning, deleteVaccine, deleteVaccineGroup, updateVaccineGroup } from '../controllers/vaccineController';

const router = Router();

// Apply auth middleware to all routes
router.use(verifyToken);

// Master schedule (Admin/MOH)
router.get('/', getVaccines);
router.post('/', requireAnyRole(['admin', 'moh', 'supervisor']), addVaccine);
router.put('/:id', requireAnyRole(['admin', 'moh', 'supervisor']), updateVaccine);
router.delete('/:id', requireAnyRole(['admin', 'moh', 'supervisor']), deleteVaccine);
router.put('/group/:name', requireAnyRole(['admin', 'moh', 'supervisor']), updateVaccineGroup);
router.delete('/group/:name', requireAnyRole(['admin', 'moh', 'supervisor']), deleteVaccineGroup);

// Child specific timeline
router.get('/child/:id', getChildVaccinations);
router.post('/child/:id', requireAnyRole(['phm', 'midwife']), markVaccineAdministered);
router.delete('/child/:id/record/:record_id', requireAnyRole(['phm', 'midwife']), removeVaccineRecord);
router.post('/child/:id/warning', requireAnyRole(['phm', 'midwife']), sendOverdueWarning);

export default router;
