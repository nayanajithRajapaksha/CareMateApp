"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const blogController_1 = require("../controllers/blogController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// Public / Parent reader endpoints
router.get('/', blogController_1.getBlogs);
router.get('/:id', blogController_1.getBlogById);
// Admin / MOH management endpoints
router.post('/', authMiddleware_1.verifyToken, (0, authMiddleware_1.requireAnyRole)(['admin', 'moh', 'supervisor']), blogController_1.createBlog);
router.put('/:id', authMiddleware_1.verifyToken, (0, authMiddleware_1.requireAnyRole)(['admin', 'moh', 'supervisor']), blogController_1.updateBlog);
router.delete('/:id', authMiddleware_1.verifyToken, (0, authMiddleware_1.requireAnyRole)(['admin', 'moh', 'supervisor']), blogController_1.deleteBlog);
exports.default = router;
//# sourceMappingURL=blogRoutes.js.map