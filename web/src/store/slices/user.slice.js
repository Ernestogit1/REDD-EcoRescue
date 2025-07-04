import { createSlice } from '@reduxjs/toolkit';
import { getUserProfile} from '../api/user.api';

const initialState = {
  profile: null,
  isLoading: false,
  isUpdating: false,
  error: null,
  updateSuccess: false
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
 setCredentials: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    clearUpdateSuccess: (state) => {
      state.updateSuccess = false;
    },
    setProfile: (state, action) => {
      state.profile = action.payload;
    },
    clearProfile: (state) => {
      state.profile = null;
      state.error = null;
      state.updateSuccess = false;
    },
    updateProfileField: (state, action) => {
      const { field, value } = action.payload;
      if (state.profile) {
        state.profile[field] = value;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Get User Profile
      .addCase(getUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile = action.payload.data.user;
        state.error = null;
      })
      .addCase(getUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
      
   
    
   
  }
});

export const { 
  clearError, 
  clearUpdateSuccess, 
  setProfile, 
  clearProfile, 
  updateProfileField 
} = userSlice.actions;

export default userSlice.reducer;