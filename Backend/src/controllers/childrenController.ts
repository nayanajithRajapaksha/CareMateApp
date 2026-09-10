import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { createChildWithMedicalProfile, getChildrenByParentId } from '../models/childModel';

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
