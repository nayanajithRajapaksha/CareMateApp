import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { createChildWithMedicalProfile, getChildrenByParentId, updateChildMedicalProfile, getAllChildren as getAllChildrenDb } from '../models/childModel';

export const registerChild = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const parent_id = req.user.id;
    const {
      full_name, dob, gender, relationship, birth_cert_number,
      blood_group, birth_weight_kg, allergies, existing_conditions, primary_clinic
    } = req.body;

    if (!full_name || !dob || !gender || !relationship || !blood_group || birth_weight_kg === undefined) {
      res.status(400).json({ error: 'Missing required child or medical profile fields.' });
      return;
    }

    const childId = await createChildWithMedicalProfile(
      { parent_id, full_name, dob, gender, relationship, birth_cert_number },
      { blood_group, birth_weight_kg, allergies, existing_conditions, primary_clinic }
    );

    res.status(201).json({ message: 'Child registered successfully', childId });
  } catch (error) {
    console.error('Error registering child:', error);
    res.status(500).json({ error: 'Internal server error during child registration.' });
  }
};

export const getChildren = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const parent_id = req.user.id;
    const children = await getChildrenByParentId(parent_id);
    res.status(200).json({ children });
  } catch (error) {
    console.error('Error fetching children:', error);
    res.status(500).json({ error: 'Internal server error while fetching children.' });
  }
};

export const updateChild = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (req.user?.role?.toLowerCase() !== 'phm') {
      res.status(403).json({ error: 'Forbidden. Only PHMs can update child records.' });
      return;
    }

    const childId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { blood_group, birth_weight_kg, allergies, existing_conditions, primary_clinic } = req.body;

    await updateChildMedicalProfile(childId, { blood_group, birth_weight_kg, allergies, existing_conditions, primary_clinic });
    
    res.status(200).json({ message: 'Child medical profile updated successfully' });
  } catch (error) {
    console.error('Error updating child:', error);
    res.status(500).json({ error: 'Internal server error while updating child.' });
  }
};

export const getAllChildrenController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (req.user?.role?.toLowerCase() !== 'phm') {
      res.status(403).json({ error: 'Forbidden. Only PHMs can view all children.' });
      return;
    }

    const children = await getAllChildrenDb();
    res.status(200).json({ children });
  } catch (error) {
    console.error('Error fetching all children:', error);
    res.status(500).json({ error: 'Internal server error while fetching children.' });
  }
};
