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
  AccordionDetails,
  Button
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
import jsPDF from 'jspdf';
import tuplogo from '../../assets/tuplogo.png';

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

  // Helper to add a section header
  const addSectionHeader = (doc, text, y) => {
    doc.setFontSize(15);
    doc.setTextColor(40, 40, 120);
    doc.text(text, 14, y);
    doc.setTextColor(0, 0, 0);
    return y + 8;
  };

  // Helper to add a formal table with visible borders and alternating row colors
  const addFormalTable = (doc, headers, rows, startY) => {
    doc.setFontSize(10);
    const margin = 14;
    const pageWidth = doc.internal.pageSize.width;
    const tableWidth = pageWidth - margin * 2;
    const colWidth = tableWidth / headers.length;
    const rowHeight = 8;
    let y = startY;

    // Draw header background
    doc.setFillColor(230, 236, 245);
    doc.rect(margin, y - 6, tableWidth, rowHeight, 'F');
    doc.setDrawColor(44, 62, 80);
    doc.setLineWidth(0.4);
    doc.rect(margin, y - 6, tableWidth, rowHeight, 'S');

    // Draw header text
    doc.setFont(undefined, 'bold');
    headers.forEach((header, i) => {
      doc.text(String(header), margin + i * colWidth + 2, y, { maxWidth: colWidth - 4 });
      if (i > 0) {
        doc.line(margin + i * colWidth, y - 6, margin + i * colWidth, y + rowHeight - 6);
      }
    });
    doc.setFont(undefined, 'normal');
    y += rowHeight;

    // Draw rows
    rows.forEach((row, rowIdx) => {
      // Page break if needed
      if (y > 270) {
        doc.addPage();
        y = 20;
        // Redraw header
        doc.setFillColor(230, 236, 245);
        doc.rect(margin, y - 6, tableWidth, rowHeight, 'F');
        doc.setDrawColor(44, 62, 80);
        doc.setLineWidth(0.4);
        doc.rect(margin, y - 6, tableWidth, rowHeight, 'S');
        doc.setFont(undefined, 'bold');
        headers.forEach((header, i) => {
          doc.text(String(header), margin + i * colWidth + 2, y, { maxWidth: colWidth - 4 });
          if (i > 0) {
            doc.line(margin + i * colWidth, y - 6, margin + i * colWidth, y + rowHeight - 6);
          }
        });
        doc.setFont(undefined, 'normal');
        y += rowHeight;
      }

      // Alternate row background
      if (rowIdx % 2 === 1) {
        doc.setFillColor(245, 249, 255);
        doc.rect(margin, y - 6, tableWidth, rowHeight, 'F');
      }
      // Draw row border
      doc.setDrawColor(180, 180, 180);
      doc.setLineWidth(0.2);
      doc.rect(margin, y - 6, tableWidth, rowHeight, 'S');

      // Draw row text
      row.forEach((cell, i) => {
        doc.text(String(cell), margin + i * colWidth + 2, y, { maxWidth: colWidth - 4 });
        if (i > 0) {
          doc.line(margin + i * colWidth, y - 6, margin + i * colWidth, y + rowHeight - 6);
        }
      });
      y += rowHeight;
    });

    return y;
  };

  // PDF export handler
  const handleExportPDF = () => {
    const doc = new jsPDF();
    let y = 20;

    // Add logo
    doc.addImage(tuplogo, 'PNG', 14, y, 18, 18);
    doc.setFontSize(18);
    doc.text('EcoRescue Analytics Report', 36, y + 10);

    // Research title
    doc.setFontSize(12);
    doc.text('EcoRescue: An Interactive Game to Promote Wildlife Conservation \nand Critical Thinking in Young Learners', 14, y + 24);

    // Export date
    const exportDate = new Date().toLocaleString();
    doc.setFontSize(10);
    doc.text(`\nExported: ${exportDate}\n`, 14, y + 32);

    y += 40;

    // Overview Cards
    y = addSectionHeader(doc, 'Overview', y);
    y = addFormalTable(doc,
      ['Metric', 'Value'],
      [
        ['Total Users', userStats?.totalUsers || 0],
        ['Total Games Played', overallStats?.totalGames || 0],
        ['Available Levels', userStats?.availableLevels?.length || 0],
        ['Active Level Players', userStats?.topLevelPlayers?.length || 0]
      ],
      y
    );
    y += 4;

    // User Registration Chart
    y = addSectionHeader(doc, 'User Registration (Last 30 Days)', y);
    if (chartData?.userRegistration?.labels && chartData?.userRegistration?.datasets?.[0]?.data) {
      y = addFormalTable(
        doc,
        ['Date', 'Registrations'],
        chartData.userRegistration.labels.map((label, i) => [
          label,
          chartData.userRegistration.datasets[0].data[i]
        ]),
        y
      );
    } else {
      doc.text('No data available.', 14, y);
      y += 7;
    }
    y += 4;

    // Game Popularity Chart
    y = addSectionHeader(doc, 'Game Popularity', y);
    if (chartData?.gamePopularity?.labels && chartData?.gamePopularity?.datasets?.[0]?.data) {
      y = addFormalTable(
        doc,
        ['Game', 'Plays'],
        chartData.gamePopularity.labels.map((label, i) => [
          label,
          chartData.gamePopularity.datasets[0].data[i]
        ]),
        y
      );
    } else {
      doc.text('No data available.', 14, y);
      y += 7;
    }
    y += 4;

    // Rank Distribution Chart
    y = addSectionHeader(doc, 'User Rank Distribution', y);
    if (chartData?.rankDistribution?.labels && chartData?.rankDistribution?.datasets?.[0]?.data) {
      y = addFormalTable(
        doc,
        ['Rank', 'Count'],
        chartData.rankDistribution.labels.map((label, i) => [
          label,
          chartData.rankDistribution.datasets[0].data[i]
        ]),
        y
      );
    } else {
      doc.text('No data available.', 14, y);
      y += 7;
    }
    y += 4;

    // Difficulty Performance Chart
    y = addSectionHeader(doc, 'Games by Difficulty Level', y);
    if (chartData?.difficultyPerformance?.labels && chartData?.difficultyPerformance?.datasets?.[0]?.data) {
      y = addFormalTable(
        doc,
        ['Difficulty', 'Games'],
        chartData.difficultyPerformance.labels.map((label, i) => [
          label,
          chartData.difficultyPerformance.datasets[0].data[i]
        ]),
        y
      );
    } else {
      doc.text('No data available.', 14, y);
      y += 7;
    }
    y += 4;

    // Top Players Chart
    y = addSectionHeader(doc, 'Top Players by Points', y);
    if (chartData?.topPlayers?.labels && chartData?.topPlayers?.datasets?.[0]?.data) {
      y = addFormalTable(
        doc,
        ['Player', 'Points'],
        chartData.topPlayers.labels.map((label, i) => [
          label,
          chartData.topPlayers.datasets[0].data[i]
        ]),
        y
      );
    } else {
      doc.text('No data available.', 14, y);
      y += 7;
    }
    y += 4;

    // Most Active Players Chart
    y = addSectionHeader(doc, 'Most Active Players', y);
    if (chartData?.mostActivePlayers?.labels && chartData?.mostActivePlayers?.datasets?.[0]?.data) {
      y = addFormalTable(
        doc,
        ['Player', 'Points'],
        chartData.mostActivePlayers.labels.map((label, i) => [
          label,
          chartData.mostActivePlayers.datasets[0].data[i]
        ]),
        y
      );
    } else {
      doc.text('No data available.', 14, y);
      y += 7;
    }
    y += 4;

    // Game Leaderboards
    y = addSectionHeader(doc, 'Top Players by Web Game', y);
    const gameSections = [
      { title: 'Card Game', players: userStats?.topCardPlayers },
      { title: 'Puzzle Game', players: userStats?.topPuzzlePlayers },
      { title: 'Match Game', players: userStats?.topMatchPlayers },
      { title: 'Color Game', players: userStats?.topColorPlayers }
    ];
    gameSections.forEach(section => {
      doc.setFontSize(12);
      doc.text(section.title, 14, y);
      y += 7;
      if (section.players?.length) {
        y = addFormalTable(
          doc,
          ['Username', 'Points', 'Rank', 'Completed', 'Images', 'Best Score', 'Best Time', 'Total Games'],
          section.players.slice(0, 5).map(player => [
            player.username,
            player.totalPoints,
            player.rank,
            player.completedGames || '-',
            player.imagesCreated || '-',
            player.highestScore || '-',
            player.bestTime ? Math.round(player.bestTime) + 's' : '-',
            player.totalGames || '-'
          ]),
          y
        );
      } else {
        doc.text('No player data available.', 14, y);
        y += 7;
      }
      y += 2;
    });

    // Top Level Players (All Levels)
    y = addSectionHeader(doc, 'Top Level Players (All Levels)', y);
    if (userStats?.topLevelPlayers?.length) {
      y = addFormalTable(
        doc,
        ['Username', 'Points', 'Rank', 'Levels', 'Completions'],
        userStats.topLevelPlayers.slice(0, 10).map(player => [
          player.username,
          player.totalPoints,
          player.rank,
          player.uniqueLevelsCount,
          player.totalCompletions
        ]),
        y
      );
    } else {
      doc.text('No level completion data available.', 14, y);
      y += 7;
    }
    y += 4;

    // Level Completion Statistics
    y = addSectionHeader(doc, 'Level Completion Statistics', y);
    if (userStats?.levelStats?.length) {
      y = addFormalTable(
        doc,
        ['Level', 'Completions', 'Players', 'Avg Points'],
        userStats.levelStats.slice(0, 10).map(stat => [
          stat._id,
          stat.totalCompletions,
          stat.uniquePlayersCount,
          Math.round(stat.averagePoints)
        ]),
        y
      );
    } else {
      doc.text('No level stats available.', 14, y);
      y += 7;
    }
    y += 4;

    // Level-Specific Leaderboards
    y = addSectionHeader(doc, 'Level-Specific Leaderboards', y);
    if (userStats?.levelLeaderboards && Object.keys(userStats.levelLeaderboards).length > 0) {
      Object.entries(userStats.levelLeaderboards)
        .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
        .forEach(([levelId, players]) => {
          doc.setFontSize(12);
          doc.text(`Level ${levelId}`, 14, y);
          y += 7;
          if (players?.length) {
            y = addFormalTable(
              doc,
              ['Username', 'Points', 'Rank', 'Completions', 'Levels'],
              players.slice(0, 5).map(player => [
                player.username,
                player.totalPoints,
                player.rank,
                player.completionsCount,
                player.uniqueLevelsCount || 1
              ]),
              y
            );
          } else {
            doc.text('No completions for this level yet.', 14, y);
            y += 7;
          }
          y += 2;
          // Add new page if y exceeds 270
          if (y > 270) {
            doc.addPage();
            y = 20;
          }
        });
    } else {
      doc.text('No level leaderboard data available.', 14, y);
      y += 7;
    }

    doc.save('analytics-report.pdf');
  };

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
            <Button
              variant="contained"
              color="primary"
              sx={{ mt: 2 }}
              onClick={handleExportPDF}
            >
              Export PDF
            </Button>
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