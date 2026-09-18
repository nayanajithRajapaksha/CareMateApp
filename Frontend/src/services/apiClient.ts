import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from './apiConfig';

/**
 * A central wrapper around fetch to handle default headers, authorization tokens,
 * and JSON parsing.
 */
export const apiClient = async (endpoint: string, options: RequestInit = {}) => {
  const token = await AsyncStorage.getItem('userToken');
  
  const headers: any = {
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = headers['Content-Type'] || 'application/json';
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
      signal: controller.signal,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'API Request failed');
    }

    return data;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      throw new Error('The server did not respond. Please make sure the backend is running and try again.');
    }

    if (error instanceof TypeError) {
      throw new Error('Unable to connect to the server. Check that the backend is running and your device is on the same network.');
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
};
