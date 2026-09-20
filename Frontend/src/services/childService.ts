import { apiClient } from './apiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from './apiConfig';
import { supabase } from '../lib/supabase';

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
      // 1. Convert local URI to Blob for Supabase upload
      const response = await fetch(imageUri);
      const blob = await response.blob();
      
      const fileExt = imageUri.split('.').pop() || 'jpg';
      const filePath = `children/${childId}-${Date.now()}.${fileExt}`;
      
      // 2. Upload to Supabase Storage 'avatars' bucket
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(filePath, blob, {
          contentType: mimeType,
          upsert: true
        });

      if (error) {
        throw new Error(error.message);
      }

      // 3. Get the public URL
      const { data: publicUrlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
        
      const publicUrl = publicUrlData.publicUrl;

      // 4. Update the child record in our database
      await childService.updateChild(childId, { profile_pic_url: publicUrl });

      return { profile_pic_url: publicUrl };
    } catch (err: any) {
      console.error('Upload Error:', err);
      throw new Error(err.message || 'Failed to upload profile picture');
    }
  }
};
