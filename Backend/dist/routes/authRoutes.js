"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const staffAuthController_1 = require("../controllers/staffAuthController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
router.post('/register', authController_1.register);
router.post('/login', authController_1.login);
router.post('/change-password', authMiddleware_1.verifyToken, authController_1.changePassword);
router.post('/forgot-password', authController_1.forgotPassword);
router.post('/reset-password', authController_1.resetPassword);
// Staff endpoints
router.post('/register-phm', staffAuthController_1.registerPHM);
router.post('/register-moh', authMiddleware_1.verifyToken, (0, authMiddleware_1.requireRole)('admin'), staffAuthController_1.registerMOH);
exports.default = router;
//# sourceMappingURL=authRoutes.js.map