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
  },

  uploadChildProfilePic: async (childId: string, imageUri: string, mimeType: string = 'image/jpeg'): Promise<{ profile_pic_url: string }> => {
    const formData = new FormData();
    const filename = imageUri.split('/').pop() || 'profile.jpg';
    
    formData.append('profile_pic', {
      uri: imageUri,
      name: filename,
      type: mimeType
    } as any);

    return await apiClient(`/children/${childId}/profile-pic`, {
      method: 'POST',
      body: formData,
    });
  }
};
