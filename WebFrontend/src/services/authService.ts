import { apiClient } from './apiClient';

export const authService = {
  login: async (credentials: any) => {
    return await apiClient('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },
  registerPHM: async (data: any) => {
    return await apiClient('/auth/register-phm', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  registerMOH: async (data: any) => {
    return await apiClient('/auth/register-moh', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};
