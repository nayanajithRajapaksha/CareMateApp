import { apiClient } from './apiClient';

export interface Vaccine {
  id: string;
  name: string;
  recommended_age_months: number;
  minimum_interval_days?: number;
}

export interface VaccinationMilestone {
  id: string;
  vaccine_id: string;
  scheduled_date: string;
  status: 'Upcoming' | 'Completed';
  vaccine: {
    name: string;
  };
}

export interface VaccinationRecord {
  id: string;
  vaccine_id: string;
  phm_id: string;
  administered_date: string;
  batch_number?: string;
  vaccine: {
    name: string;
  };
}

export interface ChildVaccinationTimeline {
  milestones: VaccinationMilestone[];
  records: VaccinationRecord[];
}

export const vaccineService = {
  getVaccines: async (): Promise<Vaccine[]> => {
    const response = await apiClient('/vaccines', { method: 'GET' });
    return response.vaccines;
  },

  addVaccine: async (data: Omit<Vaccine, 'id'>): Promise<Vaccine> => {
    const response = await apiClient('/vaccines', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.vaccine;
  },

  updateVaccine: async (id: string, data: Omit<Vaccine, 'id'>): Promise<Vaccine> => {
    const response = await apiClient(`/vaccines/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.vaccine;
  },

  getChildVaccinations: async (childId: string): Promise<ChildVaccinationTimeline> => {
    return await apiClient(`/vaccines/child/${childId}`, { method: 'GET' });
  },

  markVaccineAdministered: async (childId: string, vaccineId: string, administered_date: string, batch_number?: string) => {
    return await apiClient(`/vaccines/child/${childId}`, {
      method: 'POST',
      body: JSON.stringify({
        vaccine_id: vaccineId,
        administered_date,
        batch_number
      }),
    });
  },

  removeVaccineRecord: async (childId: string, recordId: string) => {
    return await apiClient(`/vaccines/child/${childId}/record/${recordId}`, {
      method: 'DELETE',
    });
  }
};
