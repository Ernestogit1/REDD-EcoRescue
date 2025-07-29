import React from 'react';
import { Grid, Box } from '@mui/material';
import { People, Games, EmojiEvents, TrendingUp } from '@mui/icons-material';
import { StatsCard, StatNumber, StatLabel } from '../../../styles/page/analytics.style';

const OverviewCards = ({ userStats, overallStats }) => {
  const statsData = [
    {
      icon: <People sx={{ fontSize: 40, mb: 2 }} />,
      number: userStats?.totalUsers || 0,
      label: 'Total Users',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
      icon: <Games sx={{ fontSize: 40, mb: 2 }} />,
      number: overallStats?.totalGames || 0,
      label: 'Total Games Played',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
    },
    {
      icon: <EmojiEvents sx={{ fontSize: 40, mb: 2 }} />,
      number: userStats?.availableLevels?.length || 0,
      label: 'Available Levels',
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
    },
    {
      icon: <TrendingUp sx={{ fontSize: 40, mb: 2 }} />,
      number: userStats?.topLevelPlayers?.length || 0,
      label: 'Active Level Players',
      gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
    }
  ];

  return (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      {statsData.map((stat, index) => (
        <Grid item xs={12} sm={6} md={3} key={index}>
          <StatsCard sx={{ background: stat.gradient }}>
            {stat.icon}
            <StatNumber>{stat.number.toLocaleString()}</StatNumber>
            <StatLabel>{stat.label}</StatLabel>
          </StatsCard>
        </Grid>
      ))}
    </Grid>
  );
};

export default OverviewCards;