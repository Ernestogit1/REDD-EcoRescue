import React from 'react';
import {
  Container,
  Typography,
  Grid,
  CardContent,
  CircularProgress,
  Box,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Alert
} from '@mui/material';
import {
  TrendingUp,
  People,
  Games,
  EmojiEvents,
  Person,
  AdminPanelSettings
} from '@mui/icons-material';
import AnalyticsLayout from '../../layouts/pages/analytics.layout';
import { useAnalytics } from '../../hooks/main/analytics/analytics.hook';
import {
  UserRegistrationChart,
  GamePopularityChart,
  RankDistributionChart,
  DifficultyPerformanceChart
} from '../../components/page/analytics/charts.component';
import {
  AnalyticsContainer,
  StatsCard,
  ChartContainer,
  HeaderSection,
  StatNumber,
  StatLabel
} from '../../styles/page/analytics.style';

const AnalyticsScreen = () => {
  const { chartData, userStats, gameStats, overallStats, loading, error } = useAnalytics();

  if (loading) {
    return (
      <AnalyticsLayout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ ml: 2 }}>
            Loading Analytics...
          </Typography>
        </Box>
      </AnalyticsLayout>
    );
  }

  if (error) {
    return (
      <AnalyticsLayout>
        <Container maxWidth="xl">
          <Alert severity="error" sx={{ mt: 4 }}>
            Error loading analytics: {error}
          </Alert>
        </Container>
      </AnalyticsLayout>
    );
  }

  return (
    <AnalyticsLayout>
      <AnalyticsContainer>
        <Container maxWidth="xl">
          <HeaderSection>
            <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
              📊 Analytics Dashboard
            </Typography>
            <Typography variant="h6" opacity={0.9}>
              Comprehensive insights into user engagement and game performance
            </Typography>
          </HeaderSection>

          {/* Overview Stats Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <StatsCard>
                <People sx={{ fontSize: 40, mb: 2 }} />
                <StatNumber>{userStats?.totalUsers || 0}</StatNumber>
                <StatLabel>Total Users</StatLabel>
              </StatsCard>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatsCard sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
                <Games sx={{ fontSize: 40, mb: 2 }} />
                <StatNumber>{overallStats?.totalGames || 0}</StatNumber>
                <StatLabel>Total Games Played</StatLabel>
              </StatsCard>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatsCard sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
                <AdminPanelSettings sx={{ fontSize: 40, mb: 2 }} />
                <StatNumber>{userStats?.adminUsers || 0}</StatNumber>
                <StatLabel>Admin Users</StatLabel>
              </StatsCard>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatsCard sx={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}>
                <Person sx={{ fontSize: 40, mb: 2 }} />
                <StatNumber>{userStats?.regularUsers || 0}</StatNumber>
                <StatLabel>Regular Users</StatLabel>
              </StatsCard>
            </Grid>
          </Grid>

          {/* Charts Grid */}
          <Grid container spacing={3}>
            {/* User Registration Trend */}
            <Grid item xs={12} lg={8}>
              <UserRegistrationChart data={chartData?.userRegistration} />
            </Grid>

            {/* Game Popularity */}
            <Grid item xs={12} lg={4}>
              <GamePopularityChart data={chartData?.gamePopularity} />
            </Grid>

            {/* Rank Distribution */}
            <Grid item xs={12} md={6}>
              <RankDistributionChart data={chartData?.rankDistribution} />
            </Grid>

            {/* Difficulty Performance */}
            <Grid item xs={12} md={6}>
              <DifficultyPerformanceChart data={chartData?.difficultyPerformance} />
            </Grid>

            {/* Top Users */}
            <Grid item xs={12} lg={6}>
              <ChartContainer>
                <Typography variant="h6" gutterBottom color="primary" fontWeight="bold">
                  🏆 Top Players by Points
                </Typography>
                <List>
                  {userStats?.topUsers?.length > 0 ? (
                    userStats.topUsers.slice(0, 5).map((user, index) => (
                      <ListItem key={user._id} sx={{ py: 1 }}>
                        <ListItemAvatar>
                          <Avatar sx={{ 
                            bgcolor: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : index === 2 ? '#CD7F32' : '#3B82F6',
                            fontWeight: 'bold'
                          }}>
                            {index + 1}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={user.username}
                          secondary={
                            <Box display="flex" alignItems="center" gap={1}>
                              <Chip 
                                label={`${user.points} pts`} 
                                size="small" 
                                color="primary" 
                                variant="outlined"
                              />
                              <Chip 
                                label={user.rank} 
                                size="small" 
                                color="secondary"
                              />
                            </Box>
                          }
                        />
                      </ListItem>
                    ))
                  ) : (
                    <Typography variant="body2" color="textSecondary" sx={{ p: 2 }}>
                      No user data available
                    </Typography>
                  )}
                </List>
              </ChartContainer>
            </Grid>

            {/* Most Active Users */}
            <Grid item xs={12} lg={6}>
              <ChartContainer>
                <Typography variant="h6" gutterBottom color="primary" fontWeight="bold">
                  🎮 Most Active Players
                </Typography>
                <List>
                  {overallStats?.activeUsers?.length > 0 ? (
                    overallStats.activeUsers.slice(0, 5).map((user, index) => (
                      <ListItem key={user._id} sx={{ py: 1 }}>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: '#10B981', fontWeight: 'bold' }}>
                            <EmojiEvents />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={user.username}
                          secondary={
                            <Box display="flex" alignItems="center" gap={1}>
                              <Chip 
                                label={`${user.totalGames} games`} 
                                size="small" 
                                color="success" 
                                variant="outlined"
                              />
                              <Chip 
                                label={user.rank} 
                                size="small" 
                                color="secondary"
                              />
                            </Box>
                          }
                        />
                      </ListItem>
                    ))
                  ) : (
                    <Typography variant="body2" color="textSecondary" sx={{ p: 2 }}>
                      No active user data available
                    </Typography>
                  )}
                </List>
              </ChartContainer>
            </Grid>
          </Grid>
        </Container>
      </AnalyticsContainer>
    </AnalyticsLayout>
  );
};

export default AnalyticsScreen;