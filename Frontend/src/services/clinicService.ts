import { apiClient } from './apiClient';

export interface Clinic {
  id: number;
  name: string;
  address: string;
  type: string;
  lat: number;
  lng: number;
  open: boolean;
  phone?: string;
  hours?: string;
}

export const clinicService = {
  /** Fetch all clinics from the backend database (public endpoint) */
  getAll: async (): Promise<Clinic[]> => {
    const data = await apiClient('/clinics');
    return (data.clinics || []).map((c: any) => ({
      ...c,
      id: Number(c.id),
      lat: Number(c.lat),
      lng: Number(c.lng),
      open: c.open ?? c.is_open ?? true,
    }));
  },
  
  /** Fetch specialists for a specific clinic */
  getSpecialists: async (clinicId: number): Promise<any[]> => {
    const data = await apiClient(`/clinics/${clinicId}/specialists`);
    return data.specialists || [];
  },
};
