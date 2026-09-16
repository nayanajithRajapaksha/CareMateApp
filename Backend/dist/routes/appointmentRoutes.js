"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const appointmentController_1 = require("../controllers/appointmentController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
router.get('/availability', appointmentController_1.getAvailability);
router.use(authMiddleware_1.verifyToken);
router.post('/', (0, authMiddleware_1.requireRole)('parent'), appointmentController_1.createAppointment);
router.get('/mine', (0, authMiddleware_1.requireRole)('parent'), appointmentController_1.getMyAppointments);
router.delete('/:id', (0, authMiddleware_1.requireRole)('parent'), appointmentController_1.cancelAppointment);
router.get('/my-availability', (0, authMiddleware_1.requireRole)(['phm', 'midwife']), appointmentController_1.getMyAvailability);
router.put('/my-availability', (0, authMiddleware_1.requireRole)(['phm', 'midwife']), appointmentController_1.updateMyAvailability);
router.get('/staff', (0, authMiddleware_1.requireRole)(['phm', 'midwife']), appointmentController_1.getStaffAppointments);
exports.default = router;
//# sourceMappingURL=appointmentRoutes.js.map