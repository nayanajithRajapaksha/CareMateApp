import { apiClient } from './apiClient';
import { supabase } from '../lib/supabase';

export interface UserProfile {
  email: string;
  full_name: string;
  contact_number: string | null;
  role: string;
  hospital: string | null;
  avatar_url?: string | null;
}

export const uploadAvatarToSupabase = async (uri: string, filenamePrefix?: string): Promise<string> => {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    const arrayBuffer = await new Response(blob).arrayBuffer();

    const fileExt = uri.split('.').pop()?.toLowerCase() || 'jpg';
    const cleanExt = ['jpg', 'jpeg', 'png', 'webp', 'heic'].includes(fileExt) ? fileExt : 'jpg';
    const fileName = `patient_${filenamePrefix || Date.now()}_${Date.now()}.${cleanExt}`;

    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(fileName, arrayBuffer, {
        contentType: `image/${cleanExt === 'jpg' ? 'jpeg' : cleanExt}`,
        upsert: true,
      });

    if (error) {
      console.error('Supabase avatars bucket upload error:', error);
      throw error;
    }

    const { data: publicUrlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);

    return publicUrlData.publicUrl;
  } catch (error: any) {
    console.error('Error in uploadAvatarToSupabase:', error);
    throw new Error(error.message || 'Failed to upload profile picture to avatars bucket.');
  }
};

export const profileService = {
  getProfile: async (): Promise<{ profile: UserProfile }> => {
    return await apiClient('/users/profile');
  },
  updateProfile: async (data: { full_name?: string; contact_number?: string; avatar_url?: string }): Promise<{ message: string, profile: UserProfile }> => {
    return await apiClient('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  uploadAvatar: uploadAvatarToSupabase,
};

