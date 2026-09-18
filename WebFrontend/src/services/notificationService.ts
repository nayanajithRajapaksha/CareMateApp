import { apiClient } from './apiClient';

export interface NotificationSetting {
  id: number;
  days_before: number;
}

export const notificationService = {
  getSettings: async (): Promise<{ settings: NotificationSetting[] }> => {
    return await apiClient('/notifications/settings');
  },
  
  updateSettings: async (days: number[]): Promise<{ settings: NotificationSetting[] }> => {
    return await apiClient('/notifications/settings', {
      method: 'PUT',
      body: JSON.stringify({ days }),
    });
  },
  
  triggerReminders: async (): Promise<{ message: string }> => {
    return await apiClient('/notifications/trigger', {
      method: 'POST',
    });
  },
  
  triggerSingleReminder: async (appointmentId: number): Promise<{ message: string }> => {
    return await apiClient('/notifications/trigger-single', {
      method: 'POST',
      body: JSON.stringify({ appointmentId })
    });
  }
};
