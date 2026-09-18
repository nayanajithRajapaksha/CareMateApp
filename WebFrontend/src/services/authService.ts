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
  changePassword: async (data: any) => {
    return await apiClient('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  forgotPassword: async (data: { email: string }) => {
    return await apiClient('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  resetPassword: async (data: any) => {
    return await apiClient('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
};

