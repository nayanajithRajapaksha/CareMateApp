import { Router } from 'express';
import { verifyToken, requireRole } from '../middleware/authMiddleware';
import { registerChild, getChildren, updateChild, getAllChildrenController } from '../controllers/childrenController';

const router = Router();

// Apply auth middleware to all routes in this router
router.use(verifyToken);

router.post('/register', requireRole('parent'), registerChild);
router.get('/', requireRole('parent'), getChildren);
router.get('/all', requireRole('phm'), getAllChildrenController);
router.put('/:id', requireRole(['parent', 'phm']), updateChild);

export default router;
