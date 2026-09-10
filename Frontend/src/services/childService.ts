import { apiClient } from './apiClient';

export const childService = {
  registerChild: async (childData: any) => {
    return apiClient('/children', {
      method: 'POST',
      body: JSON.stringify(childData),
    });
  },

  getChildren: async () => {
    return apiClient('/children');
  }
};
