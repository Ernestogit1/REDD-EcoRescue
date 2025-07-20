// filepath: c:\Users\LENOVO\Documents\AppDevG2\admin\src\layouts\auth\auth.layouts.jsx
import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import AdminLoginForm from '../../components/auth/loginForm.component';

// Admin theme with green colors
const adminTheme = createTheme({
  palette: {
    primary: {
      main: '#2e7d32',
      light: '#4caf50',
      dark: '#1b5e20',
    },
    secondary: {
      main: '#81c784',
    },
    background: {
      default: '#f1f8e9',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 500,
    },
  },
});

const AdminAuthLayout = () => {
  return (
    <ThemeProvider theme={adminTheme}>
      <CssBaseline />
      <AdminLoginForm />
    </ThemeProvider>
  );
};

export default AdminAuthLayout;