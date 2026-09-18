"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = require("../controllers/userController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
router.use(authMiddleware_1.verifyToken);
router.get('/profile', userController_1.getProfile);
router.put('/profile', userController_1.updateProfile);
router.put('/push-token', userController_1.updatePushToken);
router.get('/all', (0, authMiddleware_1.requireRole)('admin'), userController_1.getAllUsers);
exports.default = router;
//# sourceMappingURL=userRoutes.js.map