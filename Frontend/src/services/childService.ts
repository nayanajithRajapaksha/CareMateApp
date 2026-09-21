import { apiClient } from './apiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from './apiConfig';

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
  },

  uploadChildProfilePic: async (childId: string, imageUri: string, mimeType: string = 'image/jpeg'): Promise<{ profile_pic_url: string }> => {
    try {
      // Convert local URI to a blob, then send through backend API.
      // This avoids the Supabase RLS "new row violates row-level security policy"
      // error that occurs when uploading directly from the mobile app with the
      // anon key (which has no authenticated Supabase session).
      const imageResponse = await fetch(imageUri);
      const blob = await imageResponse.blob();

      const filename = imageUri.split('/').pop() || 'child_profile.jpg';

      const formData = new FormData();
      formData.append('profile_pic', blob, filename);

      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(`${API_BASE_URL}/children/${childId}/profile-pic`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload profile picture');
      }
      return data;
    } catch (err: any) {
      console.error('Upload Error:', err);
      throw new Error(err.message || 'Failed to upload profile picture');
    }
  }
};
