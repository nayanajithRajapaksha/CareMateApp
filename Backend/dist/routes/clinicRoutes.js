"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const clinicController_1 = require("../controllers/clinicController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// Public — mobile app can fetch the clinic list without auth
router.get('/', clinicController_1.getAllClinics);
// MOH-protected write operations
router.use(authMiddleware_1.verifyToken);
router.post('/', (0, authMiddleware_1.requireRole)('moh'), clinicController_1.createClinic);
router.put('/:id', (0, authMiddleware_1.requireRole)('moh'), clinicController_1.updateClinic);
router.delete('/:id', (0, authMiddleware_1.requireRole)('moh'), clinicController_1.deleteClinic);
exports.default = router;
//# sourceMappingURL=clinicRoutes.js.map