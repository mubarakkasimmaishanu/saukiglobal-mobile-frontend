// src/api/apiClient.ts
import axios from 'axios';
import { storage } from '../services/storage';

const BASE_URL = 'https://saukiglobal.com/api/v1';

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 15000,
});

let onUnauthorizedCallback: (() => void) | null = null;

export const setOnUnauthorized = (callback: () => void) => {
  onUnauthorizedCallback = callback;
};

// Request Interceptor: Attach bearer token if stored
apiClient.interceptors.request.use(
  async (config) => {
    const token = await storage.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Uniformly parse body success and catch 401s
apiClient.interceptors.response.use(
  (response) => {
    // Backend API can return status: false within a 200 OK wrapper
    if (response.data && response.data.status === false) {
      return Promise.reject(new Error(response.data.message || 'API request failed'));
    }
    return response;
  },
  async (error) => {
    if (error.response) {
      const { status, data } = error.response;
      
      // Auto-logout if token is expired or unauthorized
      if (status === 401) {
        await storage.clearAll();
        if (onUnauthorizedCallback) {
          onUnauthorizedCallback();
        }
      }
      
      const message = data?.message || `Request failed with status ${status}`;
      return Promise.reject(new Error(message));
    }
    
    if (error.request) {
      return Promise.reject(new Error('Network error. Check your internet connection.'));
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
export { BASE_URL };
