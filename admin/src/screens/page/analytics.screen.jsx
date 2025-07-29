import React, { useState } from 'react';
import {
  Container,
  Typography,
  Grid,
  CircularProgress,
  Box,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  People,
  Games,
  Person,
  AdminPanelSettings,
  Casino,
  Extension,
  SportsEsports,
  Palette,
  ExpandMore,
  EmojiEvents,
  TrendingUp
} from '@mui/icons-material';
import AnalyticsLayout from '../../layouts/pages/analytics.layout';
import { useAnalytics } from '../../hooks/main/analytics/analytics.hook';
import {
  UserRegistrationChart,
  GamePopularityChart,
  RankDistributionChart,
  DifficultyPerformanceChart,
  TopPlayersChart,
  MostActivePlayersChart
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
  const [selectedLevel, setSelectedLevel] = useState('');

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

  // Helper function to render game leaderboard
  const renderGameLeaderboard = (players, title, icon, color) => (
    <ChartContainer>
      <Typography variant="h6" gutterBottom color="primary" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {icon}
        {title}
      </Typography>
      <List>
        {players?.length > 0 ? (
          players.slice(0, 5).map((player, index) => (
            <ListItem key={player._id} sx={{ py: 1 }}>
              <ListItemAvatar>
                <Avatar sx={{ 
                  bgcolor: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : index === 2 ? '#CD7F32' : color,
                  fontWeight: 'bold'
                }}>
                  {index + 1}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={player.username}
                secondary={
                  <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                    <Chip 
                      label={`${player.totalPoints} pts`} 
                      size="small" 
                      color="primary" 
                      variant="outlined"
                    />
                    <Chip 
                      label={player.rank} 
                      size="small" 
                      color="secondary"
                    />
                    {player.completedGames && (
                      <Chip 
                        label={`${player.completedGames} completed`} 
                        size="small" 
                        color="success"
                        variant="outlined"
                      />
                    )}
                    {player.imagesCreated && (
                      <Chip 
                        label={`${player.imagesCreated} images`} 
                        size="small" 
                        color="info"
                        variant="outlined"
                      />
                    )}
                    {player.highestScore && (
                      <Chip 
                        label={`Best: ${player.highestScore}`} 
                        size="small" 
                        color="warning"
                        variant="outlined"
                      />
                    )}
                    {player.bestTime && (
                      <Chip 
                        label={`Best time: ${Math.round(player.bestTime)}s`} 
                        size="small" 
                        color="info"
                        variant="outlined"
                      />
                    )}
                    {player.totalGames && (
                      <Chip 
                        label={`${player.totalGames} games`} 
                        size="small" 
                        color="default"
                        variant="outlined"
                      />
                    )}
                  </Box>
                }
              />
            </ListItem>
          ))
        ) : (
          <Typography variant="body2" color="textSecondary" sx={{ p: 2 }}>
            No player data available for this game
          </Typography>
        )}
      </List>
    </ChartContainer>
  );

  // Helper function to render level leaderboard
  const renderLevelLeaderboard = (levelId, players) => (
    <ChartContainer key={levelId} sx={{ mb: 2 }}>
      <Typography variant="h6" gutterBottom color="primary" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <EmojiEvents sx={{ color: '#FFD700' }} />
        Level {levelId} Leaderboard
      </Typography>
      <List>
        {players?.length > 0 ? (
          players.slice(0, 5).map((player, index) => (
            <ListItem key={player._id} sx={{ py: 1 }}>
              <ListItemAvatar>
                <Avatar sx={{ 
                  bgcolor: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : index === 2 ? '#CD7F32' : '#3B82F6',
                  fontWeight: 'bold'
                }}>
                  {index + 1}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={player.username}
                secondary={
                  <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                    <Chip 
                      label={`${player.totalPoints} pts`} 
                      size="small" 
                      color="primary" 
                      variant="outlined"
                    />
                    <Chip 
                      label={player.rank} 
                      size="small" 
                      color="secondary"
                    />
                    <Chip 
                      label={`${player.completionsCount} completions`} 
                      size="small" 
                      color="success"
                      variant="outlined"
                    />
                    <Chip 
                      label={`${player.uniqueLevelsCount || 1} levels`} 
                      size="small" 
                      color="info"
                      variant="outlined"
                    />
                  </Box>
                }
              />
            </ListItem>
          ))
        ) : (
          <Typography variant="body2" color="textSecondary" sx={{ p: 2 }}>
            No completions for this level yet
          </Typography>
        )}
      </List>
    </ChartContainer>
  );

  // Helper function to render level statistics
  const renderLevelStats = () => (
    <ChartContainer>
      <Typography variant="h6" gutterBottom color="primary" fontWeight="bold">
        📊 Level Completion Statistics
      </Typography>
      <List>
        {userStats?.levelStats?.slice(0, 10).map((stat, index) => (
          <ListItem key={stat._id} sx={{ py: 1 }}>
            <ListItemAvatar>
              <Avatar sx={{ bgcolor: '#9C27B0', fontWeight: 'bold' }}>
                L{stat._id}
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={`Level ${stat._id}`}
              secondary={
                <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                  <Chip 
                    label={`${stat.totalCompletions} completions`} 
                    size="small" 
                    color="primary" 
                    variant="outlined"
                  />
                  <Chip 
                    label={`${stat.uniquePlayersCount} players`} 
                    size="small" 
                    color="secondary"
                    variant="outlined"
                  />
                  <Chip 
                    label={`${Math.round(stat.averagePoints)} avg pts`} 
                    size="small" 
                    color="success"
                    variant="outlined"
                  />
                </Box>
              }
            />
          </ListItem>
        ))}
      </List>
    </ChartContainer>
  );

  return (
    <AnalyticsLayout>
      <AnalyticsContainer>
        <Container maxWidth="xl">
          <HeaderSection>
            <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
              📊 Analytics Dashboard
            </Typography>
            <Typography variant="h6" opacity={0.9}>
              Comprehensive insights into user engagement and level performance
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
                <EmojiEvents sx={{ fontSize: 40, mb: 2 }} />
                <StatNumber>{userStats?.availableLevels?.length || 0}</StatNumber>
                <StatLabel>Available Levels</StatLabel>
              </StatsCard>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatsCard sx={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}>
                <TrendingUp sx={{ fontSize: 40, mb: 2 }} />
                <StatNumber>{userStats?.topLevelPlayers?.length || 0}</StatNumber>
                <StatLabel>Active Level Players</StatLabel>
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

            {/* TOP LEVEL PLAYERS */}
            <Grid item xs={12} lg={6}>
              <ChartContainer>
                <Typography variant="h6" gutterBottom color="primary" fontWeight="bold">
                  🏆 Top Level Players (All Levels)
                </Typography>
                <List>
                  {userStats?.topLevelPlayers?.length > 0 ? (
                    userStats.topLevelPlayers.slice(0, 5).map((player, index) => (
                      <ListItem key={player._id} sx={{ py: 1 }}>
                        <ListItemAvatar>
                          <Avatar sx={{ 
                            bgcolor: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : index === 2 ? '#CD7F32' : '#3B82F6',
                            fontWeight: 'bold'
                          }}>
                            {index + 1}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={player.username}
                          secondary={
                            <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                              <Chip 
                                label={`${player.totalPoints} pts`} 
                                size="small" 
                                color="primary" 
                                variant="outlined"
                              />
                              <Chip 
                                label={player.rank} 
                                size="small" 
                                color="secondary"
                              />
                              <Chip 
                                label={`${player.uniqueLevelsCount} levels`} 
                                size="small" 
                                color="success"
                                variant="outlined"
                              />
                              <Chip 
                                label={`${player.totalCompletions} completions`} 
                                size="small" 
                                color="info"
                                variant="outlined"
                              />
                            </Box>
                          }
                        />
                      </ListItem>
                    ))
                  ) : (
                    <Typography variant="body2" color="textSecondary" sx={{ p: 2 }}>
                      No level completion data available
                    </Typography>
                  )}
                </List>
              </ChartContainer>
            </Grid>

            {/* Level Statistics */}
            <Grid item xs={12} lg={6}>
              {renderLevelStats()}
            </Grid>

            {/* ===== GAME-SPECIFIC LEADERBOARDS SECTION ===== */}
            <Grid item xs={12}>
              <ChartContainer>
                <Typography variant="h5" gutterBottom color="primary" fontWeight="bold" sx={{ mb: 3 }}>
                  🎮 Top Players by Web Game
                </Typography>
                
                <Grid container spacing={3}>
                  {/* Card Game Top Players */}
                  <Grid item xs={12} lg={6}>
                    {renderGameLeaderboard(
                      userStats?.topCardPlayers,
                      "Top Card Game Players",
                      <Casino sx={{ color: '#2196F3' }} />,
                      '#2196F3'
                    )}
                  </Grid>

                  {/* Puzzle Game Top Players */}
                  <Grid item xs={12} lg={6}>
                    {renderGameLeaderboard(
                      userStats?.topPuzzlePlayers,
                      "Top Puzzle Game Players",
                      <Extension sx={{ color: '#4CAF50' }} />,
                      '#4CAF50'
                    )}
                  </Grid>

                  {/* Match Game Top Players */}
                  <Grid item xs={12} lg={6}>
                    {renderGameLeaderboard(
                      userStats?.topMatchPlayers,
                      "Top Match Game Players",
                      <SportsEsports sx={{ color: '#FF9800' }} />,
                      '#FF9800'
                    )}
                  </Grid>

                  {/* Color Game Top Players */}
                  <Grid item xs={12} lg={6}>
                    {renderGameLeaderboard(
                      userStats?.topColorPlayers,
                      "Top Color Game Players",
                      <Palette sx={{ color: '#9C27B0' }} />,
                      '#9C27B0'
                    )}
                  </Grid>
                </Grid>
              </ChartContainer>
            </Grid>

            {/* Level-Specific Leaderboards */}
            <Grid item xs={12}>
              <ChartContainer>
                <Typography variant="h6" gutterBottom color="primary" fontWeight="bold" sx={{ mb: 3 }}>
                  🎯 Level-Specific Leaderboards
                </Typography>
                
                {userStats?.levelLeaderboards && Object.keys(userStats.levelLeaderboards).length > 0 ? (
                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMore />}>
                      <Typography variant="h6" fontWeight="bold">
                        View Leaderboards by Level ({Object.keys(userStats.levelLeaderboards).length} levels available)
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Grid container spacing={2}>
                        {Object.entries(userStats.levelLeaderboards)
                          .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
                          .map(([levelId, players]) => (
                            <Grid item xs={12} md={6} key={levelId}>
                              {renderLevelLeaderboard(levelId, players)}
                            </Grid>
                          ))}
                      </Grid>
                    </AccordionDetails>
                  </Accordion>
                ) : (
                  <Typography variant="body2" color="textSecondary" sx={{ p: 2 }}>
                    No level leaderboard data available
                  </Typography>
                )}
              </ChartContainer>
            </Grid>

            {/* Existing Charts */}
            <Grid item xs={12} md={6}>
              <RankDistributionChart data={chartData?.rankDistribution} />
            </Grid>

            <Grid item xs={12} md={6}>
              <DifficultyPerformanceChart data={chartData?.difficultyPerformance} />
            </Grid>

            <Grid item xs={12} lg={6}>
              <TopPlayersChart data={chartData?.topPlayers} />
            </Grid>

            <Grid item xs={12} lg={6}>
              <MostActivePlayersChart data={chartData?.mostActivePlayers} />
            </Grid>
          </Grid>
        </Container>
      </AnalyticsContainer>
    </AnalyticsLayout>
  );
};

export default AnalyticsScreen;