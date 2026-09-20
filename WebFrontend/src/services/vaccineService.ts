import api from './apiClient';

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
    const response = await api.get('/vaccines');
    return response.data.vaccines;
  },

  addVaccine: async (data: Omit<Vaccine, 'id'>): Promise<Vaccine> => {
    const response = await api.post('/vaccines', data);
    return response.data.vaccine;
  },

  updateVaccine: async (id: string, data: Omit<Vaccine, 'id'>): Promise<Vaccine> => {
    const response = await api.put(`/vaccines/${id}`, data);
    return response.data.vaccine;
  },

  getChildVaccinations: async (childId: string): Promise<ChildVaccinationTimeline> => {
    const response = await api.get(`/vaccines/child/${childId}`);
    return response.data;
  },

  markVaccineAdministered: async (childId: string, vaccineId: string, administered_date: string, batch_number?: string) => {
    const response = await api.post(`/vaccines/child/${childId}`, {
      vaccine_id: vaccineId,
      administered_date,
      batch_number
    });
    return response.data;
  },

  removeVaccineRecord: async (childId: string, recordId: string) => {
    const response = await api.delete(`/vaccines/child/${childId}/record/${recordId}`);
    return response.data;
  }
};
