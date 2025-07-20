import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/store';

// Components
import AdminProtectedRoute from './components/common/protectedRoute.component';

// Screens
import AdminLoginScreen from './screens/auth/login.screen';
import DashboardScreen from './screens/page/dashboard.screen';

function App() {
  return (
    <Provider store={store}>
      <Router>
        <Routes>
          <Route 
            path="/login" 
            element={
              <AdminProtectedRoute isPublic={true} redirectTo="/dashboard">
                <AdminLoginScreen />
              </AdminProtectedRoute>
            } 
          />
          
          <Route 
            path="/dashboard" 
            element={
              <AdminProtectedRoute>
                <DashboardScreen />
              </AdminProtectedRoute>
            } 
          />

          <Route 
            path="/" 
            element={<Navigate to="/login" replace />} 
          />
          
          <Route 
            path="*" 
            element={<Navigate to="/login" replace />} 
          />
        </Routes>
      </Router>
    </Provider>
  );
}

export default App;