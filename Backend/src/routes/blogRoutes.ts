import { Router } from 'express';
import { getBlogs, getBlogById, createBlog, updateBlog, deleteBlog } from '../controllers/blogController';
import { verifyToken, requireAnyRole } from '../middleware/authMiddleware';

const router = Router();

// Public / Parent reader endpoints
router.get('/', getBlogs);
router.get('/:id', getBlogById);

// Admin / MOH management endpoints
router.post('/', verifyToken, requireAnyRole(['admin', 'moh', 'supervisor']), createBlog);
router.put('/:id', verifyToken, requireAnyRole(['admin', 'moh', 'supervisor']), updateBlog);
router.delete('/:id', verifyToken, requireAnyRole(['admin', 'moh', 'supervisor']), deleteBlog);

export default router;
