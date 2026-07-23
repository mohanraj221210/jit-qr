import axios from 'axios';
import { getAdminAuth, clearAdminAuth } from '../utils/storage';
import toast from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.notice.jit.college';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

// Request Interceptor: Attach bearer token
apiClient.interceptors.request.use(
  (config) => {
    const token = getAdminAuth();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle errors globally
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const data = error.response?.data;

    if (status === 401 || status === 403) {
      clearAdminAuth();
      // Redirect to login page if window is defined and not already on /login
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        const msg = status === 401 ? 'Session expired. Please login again.' : 'Access denied. You do not have permissions.';
        toast.error(msg);
        window.location.href = '/login';
      }
    } else if (status === 404) {
      toast.error('Resource not found.');
    } else if (status >= 500) {
      toast.error(data?.message || 'Server error. Please try again later.');
    } else if (!error.response) {
      toast.error('Network error. Check your internet connection.');
    }

    return Promise.reject(error);
  }
);
