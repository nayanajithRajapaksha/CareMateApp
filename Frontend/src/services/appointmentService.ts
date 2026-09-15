import { apiClient } from './apiClient';

export interface AppointmentSlot {
  start_time: string;
  end_time: string;
  available: boolean;
  remaining: number;
}

export const appointmentService = {
  getAvailability: async (clinicId: number, date: string) => {
    return apiClient(`/appointments/availability?clinic_id=${clinicId}&date=${date}`);
  },

  book: async (payload: { clinic_id: number; child_id: string; appointment_date: string; start_time: string }) => {
    return apiClient('/appointments', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  getMine: async () => apiClient('/appointments/mine'),

  cancel: async (id: number) => {
    return apiClient(`/appointments/${id}`, {
      method: 'DELETE',
    });
  },

  getMyAvailability: async () => apiClient('/appointments/my-availability'),

  updateMyAvailability: async (payload: { start_time: string; end_time: string; max_bookings: number }) => {
    return apiClient('/appointments/my-availability', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  getStaffBookings: async () => apiClient('/appointments/staff'),
};
