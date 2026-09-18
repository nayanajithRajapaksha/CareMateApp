import { Router } from 'express';
import { getAllClinics, createClinic, updateClinic, deleteClinic, getSpecialists, createSpecialist } from '../controllers/clinicController';
import { verifyToken, requireRole } from '../middleware/authMiddleware';

const router = Router();

// Public — mobile app can fetch the clinic list without auth
router.get('/', getAllClinics);
router.get('/:id/specialists', getSpecialists);

// MOH-protected write operations
router.use(verifyToken);
router.post('/',     requireRole('moh'), createClinic);
router.put('/:id',   requireRole('moh'), updateClinic);
router.delete('/:id', requireRole('moh'), deleteClinic);
router.post('/:id/specialists', requireRole('moh'), createSpecialist);

export default router;
