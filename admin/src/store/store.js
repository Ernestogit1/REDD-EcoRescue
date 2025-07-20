import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/auth.slice';
import adminReducer from './slices/admin.slice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    admin: adminReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});