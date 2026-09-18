"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const clinicController_1 = require("../controllers/clinicController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// Public — mobile app can fetch the clinic list without auth
router.get('/', clinicController_1.getAllClinics);
router.get('/:id/specialists', clinicController_1.getSpecialists);
// MOH-protected write operations
router.use(authMiddleware_1.verifyToken);
router.post('/', (0, authMiddleware_1.requireRole)('moh'), clinicController_1.createClinic);
router.put('/:id', (0, authMiddleware_1.requireRole)('moh'), clinicController_1.updateClinic);
router.delete('/:id', (0, authMiddleware_1.requireRole)('moh'), clinicController_1.deleteClinic);
router.post('/:id/specialists', (0, authMiddleware_1.requireRole)('moh'), clinicController_1.createSpecialist);
router.put('/:id/specialists/:specialistId', (0, authMiddleware_1.requireRole)('moh'), clinicController_1.updateSpecialist);
router.delete('/:id/specialists/:specialistId', (0, authMiddleware_1.requireRole)('moh'), clinicController_1.deleteSpecialist);
exports.default = router;
//# sourceMappingURL=clinicRoutes.js.map