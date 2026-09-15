import { apiClient } from './apiClient';

export const appointmentService = {
  getMyAvailability: async (hospital?: string) => apiClient(`/appointments/my-availability${hospital ? `?hospital=${encodeURIComponent(hospital)}` : ''}`),
  updateMyAvailability: async (payload: { availability_date: string; start_time: string; end_time: string; max_bookings: number; active: boolean; hospital?: string }) => apiClient('/appointments/my-availability', {
    method: 'PUT',
    body: JSON.stringify(payload),
  }),
  getStaffBookings: async (hospital?: string) => apiClient(`/appointments/staff${hospital ? `?hospital=${encodeURIComponent(hospital)}` : ''}`),
};
