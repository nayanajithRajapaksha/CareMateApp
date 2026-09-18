import { apiClient } from './apiClient';

export interface UserProfile {
  email: string;
  full_name: string;
  contact_number: string | null;
  role: string;
  hospital: string | null;
  profile_pic_url?: string;
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
  },
  updatePushToken: async (expo_push_token: string): Promise<{ message: string }> => {
    return await apiClient('/users/push-token', {
      method: 'PUT',
      body: JSON.stringify({ expo_push_token }),
    });
  },
  uploadProfilePic: async (imageUri: string, mimeType: string = 'image/jpeg'): Promise<{ profile_pic_url: string }> => {
    const formData = new FormData();
    const filename = imageUri.split('/').pop() || 'profile.jpg';
    
    formData.append('profile_pic', {
      uri: imageUri,
      name: filename,
      type: mimeType
    } as any);

    return await apiClient('/users/profile-pic', {
      method: 'POST',
      body: formData,
    });
  }
};
