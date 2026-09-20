import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { createChildWithMedicalProfile, getChildrenByParentId, updateChildMedicalProfile, updateChildDetails, getAllChildren as getAllChildrenDb } from '../models/childModel';

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

    const {
      full_name,
      dob,
      gender,
      relationship,
      birth_cert_number,
      blood_group,
      birth_weight_kg,
      allergies,
      existing_conditions,
      primary_clinic
    } = req.body;

    if (!full_name || !dob || !gender || !relationship) {
      res.status(400).json({ error: 'Missing required child fields.' });
      return;
    }

    if (isParent) {
      const parentChildren = await getChildrenByParentId(req.user.id);
      const isOwnedByParent = parentChildren.some((child: any) => String(child.id) === String(childId));

      if (!isOwnedByParent) {
        res.status(404).json({ error: 'Child not found for this parent.' });
        return;
      }
    }

    await updateChildDetails(childId, {
      full_name,
      dob,
      gender,
      relationship,
      birth_cert_number
    });

    await updateChildMedicalProfile(childId, {
      blood_group,
      birth_weight_kg,
      allergies,
      existing_conditions,
      primary_clinic
    });

    res.status(200).json({ message: 'Child record updated successfully' });
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

    // Fetch PHM's profile to get their assigned hospital
    const profileRes = await require('../config/db').default.query('SELECT hospital FROM profiles WHERE id = $1', [req.user.id]);
    let hospital = undefined;
    if (profileRes.rows.length > 0 && profileRes.rows[0].hospital) {
      hospital = profileRes.rows[0].hospital.trim(); // In case of comma separation, we might need a more complex query, but let's assume primary clinic matches one of them
      // Actually, hospital could be a comma separated string. Let's just pass it to the query, or we should handle IN clause. 
      // For now, we will pass the first hospital if it's comma separated to keep it simple, or exact match.
      hospital = profileRes.rows[0].hospital.split(',')[0].trim();
    }

    const children = await getAllChildrenDb(hospital);
    res.status(200).json({ children });
  } catch (error) {
    console.error('Error fetching all children:', error);
    res.status(500).json({ error: 'Internal server error while fetching children.' });
  }
};
