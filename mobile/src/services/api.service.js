import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Use your computer's actual IP address for mobile testing
const getBaseURL = () => {
  if (Platform.OS === 'web') {
    return 'http://localhost:5000';
  }
  // Your computer's IP address - mobile devices need this to connect
  return 'http://192.168.1.36:5000';
};

const API_BASE_URL = getBaseURL();

class ApiService {
  constructor() {
    this.baseURL = `${API_BASE_URL}/api/mobile`;
    console.log('API Base URL:', this.baseURL);
  }

  // Get auth token from storage
  async getAuthToken() {
    try {
      return await AsyncStorage.getItem('authToken');
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }

  // Set auth token in storage
  async setAuthToken(token) {
    try {
      await AsyncStorage.setItem('authToken', token);
    } catch (error) {
      console.error('Error setting auth token:', error);
    }
  }

  // Remove auth token from storage
  async removeAuthToken() {
    try {
      await AsyncStorage.removeItem('authToken');
    } catch (error) {
      console.error('Error removing auth token:', error);
    }
  }

  // Get user data from storage
  async getUserData() {
    try {
      const userData = await AsyncStorage.getItem('userData');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  }

  // Set user data in storage
  async setUserData(userData) {
    try {
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
    } catch (error) {
      console.error('Error setting user data:', error);
    }
  }

  // Remove user data from storage
  async removeUserData() {
    try {
      await AsyncStorage.removeItem('userData');
    } catch (error) {
      console.error('Error removing user data:', error);
    }
  }

  // Make API request with automatic token handling
  async makeRequest(endpoint, options = {}) {
    try {
      const token = await this.getAuthToken();
      const url = `${this.baseURL}${endpoint}`;

      console.log('Making request to:', url);

      const config = {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
          ...options.headers,
        },
        ...options,
      };

      console.log('Request config:', config);

      const response = await fetch(url, config);
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Request failed' }));
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log('Response data:', data);
      
      return data;
    } catch (error) {
      console.error('API Request error:', error);
      console.error('Error details:', {
        message: error.message,
        endpoint,
        baseURL: this.baseURL
      });
      throw error;
    }
  }

  // Auth API methods
  async register(userData) {
    const response = await this.makeRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    if (response.success) {
      await this.setAuthToken(response.data.token);
      await this.setUserData(response.data.user);
    }

    return response;
  }

  async login(credentials) {
    const response = await this.makeRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (response.success) {
      await this.setAuthToken(response.data.token);
      await this.setUserData(response.data.user);
    }

    return response;
  }

  async logout() {
    await this.removeAuthToken();
    await this.removeUserData();
  }

  async getProfile() {
    return await this.makeRequest('/auth/profile');
  }

  async updateProfile(profileData) {
    const response = await this.makeRequest('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });

    if (response.success) {
      await this.setUserData(response.data.user);
    }

    return response;
  }

  // Health check
  async healthCheck() {
    return await this.makeRequest('/health');
  }
}

export default new ApiService();
