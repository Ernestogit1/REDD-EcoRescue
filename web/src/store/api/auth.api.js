import { createAsyncThunk } from '@reduxjs/toolkit';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup  } from "firebase/auth";
import { auth, GoogleProvider} from "../../config/firebase";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;


// Get token from localStorage
const getToken = () => localStorage.getItem('authToken');

// Set token in localStorage
const setToken = (token) => localStorage.setItem('authToken', token);

// Remove token from localStorage
const removeToken = () => localStorage.removeItem('authToken');

// Register user
export const registerUser = createAsyncThunk(
  "auth/register",
  async (userData, { rejectWithValue }) => {
    try {
      const { email, password, username } = userData;

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUid = userCredential.user.uid;

      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, username, firebaseUid }),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || "Registration failed");
      }

      setToken(data.token);
      return data;
    } catch (error) {
      return rejectWithValue(error.message || "Firebase registration failed");
    }
  }
);

// Login user
export const loginUser = createAsyncThunk(
  "auth/login",
  async ({ emailOrUsername, password }, { rejectWithValue }) => {
    try {
      //  Ask backend to resolve email from username/email and validate Firebase UID
      const preLoginRes = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailOrUsername, password }),
      });

      const preLoginData = await preLoginRes.json();

      if (!preLoginRes.ok || !preLoginData.email) {
        return rejectWithValue(preLoginData.message || "User not found");
      }

      const email = preLoginData.email;

      //  Sign in with Firebase using real email
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await userCredential.user.getIdToken();

      //  Send Firebase ID token to backend again for token + user data
      const verifyRes = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      const finalData = await verifyRes.json();

      if (!verifyRes.ok) {
        return rejectWithValue(finalData.message || "Login failed");
      }

      if (finalData.token) {
        setToken(finalData.token);
      }

      return finalData;
    } catch (error) {
      return rejectWithValue(error.message || "Network error");
    }
  }
);

// google login 

export const googleAuth = createAsyncThunk(
  "auth/googleAuth",
  async (_, { rejectWithValue }) => {
    try {
      // Sign in with Google popup
      const result = await signInWithPopup(auth, GoogleProvider);
      const user = result.user;
      const idToken = await user.getIdToken();

      // Extract username from email (before @)
      const username = user.email.split('@')[0];

      // Send to backend 
      const response = await fetch(`${API_BASE_URL}/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          idToken,
          email: user.email,
          username: username,
          firebaseUid: user.uid,
          displayName: user.displayName,
          photoURL: user.photoURL
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || "Google authentication failed");
      }

      setToken(data.token);
      return data;
    } catch (error) {
      if (error.code === 'auth/popup-closed-by-user') {
        return rejectWithValue('Google login was cancelled');
      }
      return rejectWithValue(error.message || "Google authentication failed");
    }
  }
);




// Logout user
export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      const token = getToken();
      
      const response = await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Logout failed');
      }

      removeToken();

      return data;
    } catch (error) {
      removeToken();
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

// Check if user is authenticated
export const checkAuth = () => {
  const token = getToken();
  return !!token;
};

// Get current user from token
export const getCurrentUser = () => {
  const token = getToken();
  if (!token) return null;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload;
  } catch (error) {
    console.error('Error parsing token:', error);
    removeToken();
    return null;
  }
};

export const tokenUtils = {
  getToken,
  setToken,
  removeToken,
  checkAuth,
  getCurrentUser
};