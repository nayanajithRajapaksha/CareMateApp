import { apiClient } from './apiClient';

export interface UserProfile {
  email: string;
  full_name: string;
  contact_number: string | null;
  role: string;
  hospital: string | null;
}

export const profileService = {
  getProfile: async (): Promise<{ profile: UserProfile }> => {
    return await apiClient('/users/profile');
  },
  updateProfile: async (data: { full_name: string; contact_number?: string }): Promise<{ message: string, profile: UserProfile }> => {
    return await apiClient('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }
};
