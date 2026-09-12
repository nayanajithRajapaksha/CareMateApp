import { apiClient } from './apiClient';

export const staffService = {
  getUnassignedPHMs: async () => {
    return await apiClient('/staff/unassigned-phms');
  },
  assignHospital: async (profileId: string, hospital: string) => {
    return await apiClient('/staff/assign-hospital', {
      method: 'POST',
      body: JSON.stringify({ profile_id: profileId, hospital }),
    });
  }
};
