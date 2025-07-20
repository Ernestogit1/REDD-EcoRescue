import { createAsyncThunk } from '@reduxjs/toolkit';
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../config/firebase";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Admin login
export const adminLogin = createAsyncThunk(
  "admin/login",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      // Check if it's admin credentials
      if (email === 'admin@gmail.com' && password === 'admin123') {
        try {
          // First, authenticate with Firebase
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          const user = userCredential.user;
          
          // Get Firebase ID token
          const idToken = await user.getIdToken();

          // Send Firebase token to backend for verification
          const response = await fetch(`${API_BASE_URL}/admin/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: 'include',
            body: JSON.stringify({ 
              idToken,
              email, 
              password 
            }),
          });

          const data = await response.json();

          if (!response.ok) {
            return rejectWithValue(data.message || "Admin login failed");
          }

          // Store token in localStorage
          if (data.token) {
            localStorage.setItem('adminToken', data.token);
          }

          return data;

        } catch (firebaseError) {
          // If Firebase auth fails, try direct backend auth as fallback
          console.warn('Firebase auth failed, trying direct backend auth:', firebaseError.message);
          
          const response = await fetch(`${API_BASE_URL}/admin/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: 'include',
            body: JSON.stringify({ email, password }),
          });

          const data = await response.json();

          if (!response.ok) {
            return rejectWithValue(data.message || "Admin login failed");
          }

          // Store token in localStorage
          if (data.token) {
            localStorage.setItem('adminToken', data.token);
          }

          return data;
        }
      } else {
        return rejectWithValue("Access denied. Admin credentials required.");
      }
    } catch (error) {
      return rejectWithValue(error.message || "Network error");
    }
  }
);

// Admin logout
export const adminLogout = createAsyncThunk(
  'admin/logout',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('adminToken');
      
      // Logout from Firebase
      try {
        await auth.signOut();
      } catch (firebaseError) {
        console.warn('Firebase signout failed:', firebaseError.message);
      }
      
      // Logout from backend
      const response = await fetch(`${API_BASE_URL}/admin/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Admin logout failed');
      }

      localStorage.removeItem('adminToken');
      return data;
    } catch (error) {
      localStorage.removeItem('adminToken');
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

// Check admin auth
export const checkAdminAuth = () => {
  const token = localStorage.getItem('adminToken');
  return !!token;
};

export const adminTokenUtils = {
  getToken: () => localStorage.getItem('adminToken'),
  setToken: (token) => localStorage.setItem('adminToken', token),
  removeToken: () => localStorage.removeItem('adminToken'),
  checkAuth: checkAdminAuth
};