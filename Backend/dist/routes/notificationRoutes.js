"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const notificationController_1 = require("../controllers/notificationController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
router.use(authMiddleware_1.verifyToken);
router.use((0, authMiddleware_1.requireRole)(['admin', 'moh'])); // Admins and MOH can trigger notifications
router.get('/settings', notificationController_1.getNotificationSettings);
router.put('/settings', notificationController_1.updateNotificationSettings);
router.post('/trigger', notificationController_1.triggerReminders);
router.post('/trigger-single', notificationController_1.triggerSingleReminder);
exports.default = router;
//# sourceMappingURL=notificationRoutes.js.map