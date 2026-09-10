import { apiClient } from './apiClient';

export const phmService = {
  getAllChildren: async () => {
    return await apiClient('/children/all');
  },
  updateChild: async (childId: string, data: any) => {
    return await apiClient(`/children/${childId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }
};
