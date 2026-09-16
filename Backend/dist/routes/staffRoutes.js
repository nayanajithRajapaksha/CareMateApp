"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const staffController_1 = require("../controllers/staffController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
router.use(authMiddleware_1.verifyToken);
router.get('/unassigned-phms', (0, authMiddleware_1.requireRole)('moh'), staffController_1.getUnassignedPHMs);
router.get('/assigned-phms', (0, authMiddleware_1.requireRole)('moh'), staffController_1.getAssignedPHMs);
router.post('/assign-hospital', (0, authMiddleware_1.requireRole)('moh'), staffController_1.assignHospital);
router.post('/unassign-hospital', (0, authMiddleware_1.requireRole)('moh'), staffController_1.unassignHospital);
router.post('/create-phm', (0, authMiddleware_1.requireRole)('moh'), staffController_1.createPHMByMOH);
router.get('/parents', (0, authMiddleware_1.requireAnyRole)(['moh', 'phm', 'midwife']), staffController_1.getParents);
router.post('/assign-parent', (0, authMiddleware_1.requireAnyRole)(['moh', 'phm', 'midwife']), staffController_1.assignParentHospital);
exports.default = router;
//# sourceMappingURL=staffRoutes.js.map