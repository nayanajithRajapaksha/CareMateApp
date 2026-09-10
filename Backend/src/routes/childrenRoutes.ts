import { Router } from 'express';
import { verifyToken, requireRole } from '../middleware/authMiddleware';
import { registerChild, getChildren } from '../controllers/childrenController';

const router = Router();

// Apply auth middleware to all routes in this router
router.use(verifyToken);
router.use(requireRole('Parent'));

router.post('/', registerChild);
router.get('/', getChildren);

export default router;
