import React from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Button
} from '@mui/material';
import { 
  ArrowBack, 
  Dashboard, 
  Logout,
  Refresh,
  Download 
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../hooks/auth/auth.hooks';

const AnalyticsLayout = ({ children }) => {
  const navigate = useNavigate();
  const { logout, user } = useAdminAuth();

  const handleBack = () => {
    navigate('/dashboard');
  };

  const handleLogout = async () => {
    await logout();
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar 
        position="sticky" 
        sx={{ 
          background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            onClick={handleBack}
            sx={{ mr: 2 }}
          >
            <ArrowBack />
          </IconButton>
          
          <Dashboard sx={{ mr: 2 }} />
          
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            REDD Analytics Dashboard
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              color="inherit"
              startIcon={<Refresh />}
              onClick={handleRefresh}
              sx={{ 
                textTransform: 'none',
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
              }}
            >
              Refresh
            </Button>

            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Welcome, {user?.username || 'Admin'}
            </Typography>

            <IconButton color="inherit" onClick={handleLogout}>
              <Logout />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <Box component="main" sx={{ flexGrow: 1, overflow: 'auto' }}>
        {children}
      </Box>
    </Box>
  );
};

export default AnalyticsLayout;