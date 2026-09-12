import { apiClient } from './apiClient';

export const authService = {
  login: async (credentials: any) => {
    return apiClient('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  register: async (userData: any) => {
    return apiClient('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  changePassword: async (data: { currentPassword: string; newPassword: string }) => {
    return apiClient('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
};
