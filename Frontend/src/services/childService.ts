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
    const formData = new FormData();
    const filename = imageUri.split('/').pop() || 'profile.jpg';
    
    formData.append('profile_pic', {
      uri: imageUri,
      name: filename,
      type: mimeType
    } as any);

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
  }
};
