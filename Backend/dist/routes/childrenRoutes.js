"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middleware/authMiddleware");
const childrenController_1 = require("../controllers/childrenController");
const router = (0, express_1.Router)();
// Apply auth middleware to all routes in this router
router.use(authMiddleware_1.verifyToken);
router.post('/register', (0, authMiddleware_1.requireRole)('parent'), childrenController_1.registerChild);
router.get('/', (0, authMiddleware_1.requireRole)('parent'), childrenController_1.getChildren);
router.get('/all', (0, authMiddleware_1.requireRole)('phm'), childrenController_1.getAllChildrenController);
router.put('/:id', (0, authMiddleware_1.requireRole)(['parent', 'phm']), childrenController_1.updateChild);
exports.default = router;
//# sourceMappingURL=childrenRoutes.js.map