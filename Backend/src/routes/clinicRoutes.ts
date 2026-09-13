import { Router } from 'express';
import { getAllClinics, createClinic, updateClinic, deleteClinic } from '../controllers/clinicController';
import { verifyToken, requireRole } from '../middleware/authMiddleware';

const router = Router();

// Public — mobile app can fetch the clinic list without auth
router.get('/', getAllClinics);

// MOH-protected write operations
router.use(verifyToken);
router.post('/',     requireRole('moh'), createClinic);
router.put('/:id',   requireRole('moh'), updateClinic);
router.delete('/:id', requireRole('moh'), deleteClinic);

export default router;
