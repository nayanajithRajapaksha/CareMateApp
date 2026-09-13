import { apiClient } from './apiClient';
import type { Clinic } from '../pages/ClinicManager';

type ClinicPayload = Omit<Clinic, 'id'>;

export const clinicService = {
  /** Fetch all MOH clinics (public — no auth needed) */
  getAll: async (): Promise<Clinic[]> => {
    const data = await apiClient('/clinics');
    // Normalize DB column `is_open` → `open` (already aliased in SQL, but guard anyway)
    return (data.clinics as any[]).map(c => ({
      ...c,
      open: c.open ?? c.is_open ?? true,
      id:   Number(c.id),
      lat:  Number(c.lat),
      lng:  Number(c.lng),
    }));
  },

  /** Create a new clinic — requires MOH token */
  create: async (payload: ClinicPayload): Promise<Clinic> => {
    const data = await apiClient('/clinics', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    const c = data.clinic;
    return { ...c, open: c.open ?? c.is_open ?? true, id: Number(c.id), lat: Number(c.lat), lng: Number(c.lng) };
  },

  /** Update an existing clinic — requires MOH token */
  update: async (id: number, payload: ClinicPayload): Promise<Clinic> => {
    const data = await apiClient(`/clinics/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    const c = data.clinic;
    return { ...c, open: c.open ?? c.is_open ?? true, id: Number(c.id), lat: Number(c.lat), lng: Number(c.lng) };
  },

  /** Delete a clinic — requires MOH token */
  delete: async (id: number): Promise<void> => {
    await apiClient(`/clinics/${id}`, { method: 'DELETE' });
  },
};
