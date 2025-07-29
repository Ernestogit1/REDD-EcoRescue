import axios from 'axios';
import { store } from '../store/store';
import { handleTokenExpired } from '../store/slices/auth.slice';

// Create axios instance
const axiosInstance = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true
});

// Request interceptor to add token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token && token !== 'undefined' && token !== 'null') {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Adding token to request headers:', token.substring(0, 20) + '...');
    } else {
      console.log('No valid token found for request');
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const { response } = error;
    
    console.error('API request failed:', {
      url: error.config?.url,
      status: response?.status,
      message: response?.data?.message
    });
    
    if (response?.status === 401) {
      const errorCode = response.data?.code;
      
      if (errorCode === 'TOKEN_EXPIRED' || errorCode === 'INVALID_TOKEN' || errorCode === 'MALFORMED_TOKEN') {
        console.log('Token issue detected:', errorCode);
        
        // Dispatch action to handle token expiration
        store.dispatch(handleTokenExpired());
        
        // Optionally redirect to login
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;