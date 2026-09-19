import { apiClient } from './apiClient';

export interface Vaccine {
  id: string;
  name: string;
  recommended_age_months: number;
  minimum_interval_days: number;
}

export interface TimelineVaccine extends Vaccine {
  is_completed: boolean;
  administered_date: string | null;
  phm_id: string | null;
  batch_number: string | null;
  scheduled_date: string | null;
  status: string;
  milestone_id: string | null;
  record_id: string | null;
}

export const vaccineService = {
  getVaccines: async () => {
    return apiClient('/vaccines', { method: 'GET' });
  },
  
  addVaccine: async (data: { name: string; recommended_age_months: number; minimum_interval_days?: number }) => {
    return apiClient('/vaccines', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  getChildTimeline: async (childId: string) => {
    return apiClient(`/vaccines/child/${childId}`, { method: 'GET' });
  },

  markAdministered: async (childId: string, data: { vaccine_id: string; batch_number?: string; administered_date?: string }) => {
    return apiClient(`/vaccines/child/${childId}`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
};
