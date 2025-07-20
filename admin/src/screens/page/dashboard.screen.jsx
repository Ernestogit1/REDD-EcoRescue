import React from 'react';
import {
  Typography,
  Grid,
  CardContent,
  Toolbar,
  IconButton,
  Box
} from '@mui/material';
import { Dashboard, Logout, People, Settings, Analytics } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../hooks/auth/auth.hooks';
import {
  DashboardContainer,
  DashboardAppBar,
  DashboardContent,
  DashboardTitle,
  DashboardCard,
  DashboardButton,
  DashboardCardTitle,
  DashboardCardDescription,
  DashboardTestPaper,
  UserWelcomeText
} from '../../styles/page/dashboard.style';

const DashboardScreen = () => {
  const { logout, user } = useAdminAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
  };

  const handleNavigateToAnalytics = () => {
    navigate('/analytics');
  };

  const handleNavigateToUsers = () => {
    // TODO: Add user management route
    console.log('Navigate to users');
  };

  const handleNavigateToSettings = () => {
    // TODO: Add settings route
    console.log('Navigate to settings');
  };

  return (
    <DashboardContainer>
      <DashboardAppBar>
        <Toolbar>
          <Dashboard sx={{ mr: 2, fontSize: '24px' }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontSize: '1.25rem' }}>
            REDD Admin Dashboard
          </Typography>
          <UserWelcomeText>
            Welcome, {user?.username || 'Admin'}
          </UserWelcomeText>
          <IconButton color="inherit" onClick={handleLogout}>
            <Logout sx={{ fontSize: '24px' }} />
          </IconButton>
        </Toolbar>
      </DashboardAppBar>

      <DashboardContent>
        <DashboardTitle variant="h4">
          Admin Dashboard
        </DashboardTitle>

        <Grid container spacing={3} sx={{ width: '100%', margin: 0 }}>
          {/* <Grid item xs={12} md={4}>
            <DashboardCard>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <People sx={{ color: '#2e7d32', mr: 1, fontSize: '24px' }} />
                  <DashboardCardTitle>
                    User Management
                  </DashboardCardTitle>
                </Box>
                <DashboardCardDescription>
                  Manage registered users and their activities
                </DashboardCardDescription>
                <DashboardButton 
                  variant="contained"
                  onClick={handleNavigateToUsers}
                >
                  View Users
                </DashboardButton>
              </CardContent>
            </DashboardCard>
          </Grid> */}

          <Grid item xs={12} md={4}>
            <DashboardCard>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Analytics sx={{ color: '#2e7d32', mr: 1, fontSize: '24px' }} />
                  <DashboardCardTitle>
                    Analytics
                  </DashboardCardTitle>
                </Box>
                <DashboardCardDescription>
                  View game statistics and user engagement
                </DashboardCardDescription>
                <DashboardButton 
                  variant="contained"
                  onClick={handleNavigateToAnalytics}
                >
                  View Analytics
                </DashboardButton>
              </CardContent>
            </DashboardCard>
          </Grid>

          {/* <Grid item xs={12} md={4}>
            <DashboardCard>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Settings sx={{ color: '#2e7d32', mr: 1, fontSize: '24px' }} />
                  <DashboardCardTitle>
                    System Settings
                  </DashboardCardTitle>
                </Box>
                <DashboardCardDescription>
                  Configure system settings and preferences
                </DashboardCardDescription>
                <DashboardButton 
                  variant="contained"
                  onClick={handleNavigateToSettings}
                >
                  Settings
                </DashboardButton>
              </CardContent>
            </DashboardCard>
          </Grid> */}

          <Grid item xs={12}>
            <DashboardTestPaper>
              <Typography variant="h6" sx={{ mb: 2, color: '#1b5e20', fontSize: '1.25rem' }}>
                Admin Authentication Test
              </Typography>
              <Typography variant="body1" sx={{ color: '#4caf50', fontSize: '1rem' }}>
                ✅ Successfully authenticated as admin!
              </Typography>
              <Typography variant="body2" sx={{ mt: 1, color: '#666', fontSize: '0.875rem' }}>
                You have access to the admin dashboard and all administrative functions.
              </Typography>
            </DashboardTestPaper>
          </Grid>
        </Grid>
      </DashboardContent>
    </DashboardContainer>
  );
};

export default DashboardScreen;