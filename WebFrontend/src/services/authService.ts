import { apiClient } from './apiClient';

export const authService = {
  login: async (credentials: any) => {
    return await apiClient('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },
  getProfile: async () => {
    return await apiClient('/users/profile');
  },
  updateProfile: async (data: { full_name: string, contact_number?: string }) => {
    return await apiClient('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
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
  getAllUsers: async () => {
    return await apiClient('/users/all', {
      method: 'GET',
    });
  },
};

