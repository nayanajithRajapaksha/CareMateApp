import { apiClient } from './apiClient';

export const childService = {
  registerChild: async (childData: any) => {
    return apiClient('/children/register', {
      method: 'POST',
      body: JSON.stringify(childData),
    });
  },

  getChildren: async () => {
    return apiClient('/children');
  },

  updateChild: async (childId: string, childData: any) => {
    return apiClient(`/children/${childId}`, {
      method: 'PUT',
      body: JSON.stringify(childData),
    });
  }
};
