import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Get your computer's IP address for mobile testing
const getBaseURL = () => {
  if (Platform.OS === 'web') {
    return 'http://localhost:5000';
  }
  // Replace with your actual computer's IP address
  // Run 'ipconfig' in CMD to find your IPv4 address
  return 'http://192.168.1.36:5000'; // Change this to your actual IP
};

const API_BASE_URL = getBaseURL();

class ApiService {
  constructor() {
    this.baseURL = `${API_BASE_URL}/api/mobile`;
  }

  async makeRequest(endpoint, options = {}) {
    try {
      const token = await AsyncStorage.getItem('authToken');
      
      const config = {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        ...options,
      };

      console.log(`Making request to: ${this.baseURL}${endpoint}`);
      
      const response = await fetch(`${this.baseURL}${endpoint}`, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API Request error:', error);
      throw error;
    }
  }

  // Auth methods
  async register(userData) {
    return this.makeRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(credentials) {
    return this.makeRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async getProfile() {
    return this.makeRequest('/auth/profile');
  }

  async updateProfile(userData) {
    return this.makeRequest('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  // Health check
  async healthCheck() {
    return this.makeRequest('/health');
  }
}

export default new ApiService();