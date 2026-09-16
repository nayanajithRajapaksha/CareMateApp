"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllChildrenController = exports.updateChild = exports.getChildren = exports.registerChild = void 0;
const childModel_1 = require("../models/childModel");
const registerChild = async (req, res) => {
    try {
        const parent_id = req.user.id;
        const { full_name, dob, gender, relationship, birth_cert_number, blood_group, birth_weight_kg, allergies, existing_conditions, primary_clinic } = req.body;
        if (!full_name || !dob || !gender || !relationship || !blood_group || birth_weight_kg === undefined) {
            res.status(400).json({ error: 'Missing required child or medical profile fields.' });
            return;
        }
        const childId = await (0, childModel_1.createChildWithMedicalProfile)({ parent_id, full_name, dob, gender, relationship, birth_cert_number }, { blood_group, birth_weight_kg, allergies, existing_conditions, primary_clinic });
        res.status(201).json({ message: 'Child registered successfully', childId });
    }
    catch (error) {
        console.error('Error registering child:', error);
        res.status(500).json({ error: 'Internal server error during child registration.' });
    }
};
exports.registerChild = registerChild;
const getChildren = async (req, res) => {
    try {
        const parent_id = req.user.id;
        const children = await (0, childModel_1.getChildrenByParentId)(parent_id);
        res.status(200).json({ children });
    }
    catch (error) {
        console.error('Error fetching children:', error);
        res.status(500).json({ error: 'Internal server error while fetching children.' });
    }
};
exports.getChildren = getChildren;
const updateChild = async (req, res) => {
    try {
        const userRole = req.user?.role?.toLowerCase();
        const isParent = userRole === 'parent';
        const isPHM = userRole === 'phm' || userRole === 'midwife';
        if (!isParent && !isPHM) {
            res.status(403).json({ error: 'Forbidden. Only parents or PHMs can update child records.' });
            return;
        }
        const childId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        if (!childId) {
            res.status(400).json({ error: 'Child ID is required.' });
            return;
        }
        const { full_name, dob, gender, relationship, birth_cert_number, blood_group, birth_weight_kg, allergies, existing_conditions, primary_clinic } = req.body;
        if (!full_name || !dob || !gender || !relationship) {
            res.status(400).json({ error: 'Missing required child fields.' });
            return;
        }
        if (isParent) {
            const parentChildren = await (0, childModel_1.getChildrenByParentId)(req.user.id);
            const isOwnedByParent = parentChildren.some((child) => String(child.id) === String(childId));
            if (!isOwnedByParent) {
                res.status(404).json({ error: 'Child not found for this parent.' });
                return;
            }
        }
        await (0, childModel_1.updateChildDetails)(childId, {
            full_name,
            dob,
            gender,
            relationship,
            birth_cert_number
        });
        await (0, childModel_1.updateChildMedicalProfile)(childId, {
            blood_group,
            birth_weight_kg,
            allergies,
            existing_conditions,
            primary_clinic
        });
        res.status(200).json({ message: 'Child record updated successfully' });
    }
    catch (error) {
        console.error('Error updating child:', error);
        res.status(500).json({ error: 'Internal server error while updating child.' });
    }
};
exports.updateChild = updateChild;
const getAllChildrenController = async (req, res) => {
    try {
        if (req.user?.role?.toLowerCase() !== 'phm') {
            res.status(403).json({ error: 'Forbidden. Only PHMs can view all children.' });
            return;
        }
        const children = await (0, childModel_1.getAllChildren)();
        res.status(200).json({ children });
    }
    catch (error) {
        console.error('Error fetching all children:', error);
        res.status(500).json({ error: 'Internal server error while fetching children.' });
    }
};
exports.getAllChildrenController = getAllChildrenController;
//# sourceMappingURL=childrenController.js.map