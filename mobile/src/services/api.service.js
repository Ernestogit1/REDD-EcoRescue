import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { API_URL } from '@env';

const getBaseURL = () => {
  if (Platform.OS === 'web') {
    return 'http://localhost:5000';
  }
  return API_URL;
};

const API_BASE_URL = getBaseURL();

class ApiService {
  constructor() {
    this.baseURL = `${API_BASE_URL}/api/mobile`;
    this.TOKEN_KEY = 'authToken';
    console.log('API Base URL:', this.baseURL);
  }

  // Get auth token from Secure Store
  async getAuthToken() {
    try {
      return await SecureStore.getItemAsync(this.TOKEN_KEY);
    } catch (error) {
      console.error('Error getting auth token from Secure Store:', error);
      return null;
    }
  }

  // Set auth token in Secure Store
  async setAuthToken(token) {
    try {
      await SecureStore.setItemAsync(this.TOKEN_KEY, token);
    } catch (error) {
      console.error('Error setting auth token in Secure Store:', error);
    }
  }

  // Remove auth token from Secure Store
  async removeAuthToken() {
    try {
      await SecureStore.deleteItemAsync(this.TOKEN_KEY);
    } catch (error) {
      console.error('Error removing auth token from Secure Store:', error);
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
      console.log('API Request error:', error);
      console.log('Error details:', {
        message: error.message,
        endpoint,
        baseURL: this.baseURL
      });
      throw error;
    }
  }

  // Make request to non-mobile API endpoints
  async makeNonMobileRequest(endpoint, options = {}) {
    try {
      const token = await this.getAuthToken();
      const url = `${API_BASE_URL}${endpoint}`;

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
        baseURL: API_BASE_URL
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

  // Add points to user
  async addPoints(points) {
    return await this.makeRequest('/points/add', {
      method: 'POST',
      body: JSON.stringify({ points }),
    });
  }

  // Mark a level as completed for the user
  async markLevelComplete(levelId) {
    const token = await this.getAuthToken();
    if (!token) throw new Error('Not authenticated');
    const url = `${API_BASE_URL}/api/levels/complete`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ levelId: String(levelId) }),
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.message || 'Failed to mark level as complete');
    }
    return response.json();
  }

  // Shop API methods
  async getShopItems() {
    return await this.makeNonMobileRequest('/api/shop');
  }

  async getShopItem(id) {
    return await this.makeNonMobileRequest(`/api/shop/${id}`);
  }

  async buyShopItem(itemId) {
    const token = await this.getAuthToken();
    if (!token) throw new Error('Not authenticated');
    
    return await this.makeNonMobileRequest('/api/shop/buy', {
      method: 'POST',
      body: JSON.stringify({ itemId }),
    });
  }

  // Inventory API methods
  async getInventory() {
    return await this.makeNonMobileRequest('/api/inventory');
  }

  // Collected Cards API methods
  async getUserCollectedCards() {
    return await this.makeNonMobileRequest('/api/collected-cards/user');
  }
}

export default new ApiService();
