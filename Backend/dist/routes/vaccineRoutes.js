"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middleware/authMiddleware");
const vaccineController_1 = require("../controllers/vaccineController");
const router = (0, express_1.Router)();
// Apply auth middleware to all routes
router.use(authMiddleware_1.verifyToken);
// Master schedule (Admin/MOH)
router.get('/', vaccineController_1.getVaccines);
router.post('/', (0, authMiddleware_1.requireAnyRole)(['admin', 'moh', 'supervisor']), vaccineController_1.addVaccine);
router.put('/:id', (0, authMiddleware_1.requireAnyRole)(['admin', 'moh', 'supervisor']), vaccineController_1.updateVaccine);
router.delete('/:id', (0, authMiddleware_1.requireAnyRole)(['admin', 'moh', 'supervisor']), vaccineController_1.deleteVaccine);
router.put('/group/:name', (0, authMiddleware_1.requireAnyRole)(['admin', 'moh', 'supervisor']), vaccineController_1.updateVaccineGroup);
router.delete('/group/:name', (0, authMiddleware_1.requireAnyRole)(['admin', 'moh', 'supervisor']), vaccineController_1.deleteVaccineGroup);
// Child specific timeline
router.get('/child/:id', vaccineController_1.getChildVaccinations);
router.post('/child/:id', (0, authMiddleware_1.requireAnyRole)(['phm', 'midwife']), vaccineController_1.markVaccineAdministered);
router.delete('/child/:id/record/:record_id', (0, authMiddleware_1.requireAnyRole)(['phm', 'midwife']), vaccineController_1.removeVaccineRecord);
router.post('/child/:id/warning', (0, authMiddleware_1.requireAnyRole)(['phm', 'midwife']), vaccineController_1.sendOverdueWarning);
exports.default = router;
//# sourceMappingURL=vaccineRoutes.js.map