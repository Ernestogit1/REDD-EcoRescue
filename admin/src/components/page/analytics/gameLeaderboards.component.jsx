import React from 'react';
import {
  Grid,
  Typography,
  Box,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText
} from '@mui/material';
import { Casino, Extension, SportsEsports, Palette } from '@mui/icons-material';
import { ChartContainer } from '../../../styles/page/analytics.style';

const GameLeaderboards = ({ userStats }) => {
  const renderGameLeaderboard = (players, title, icon, color) => (
    <ChartContainer sx={{ height: '100%' }}>
      <Typography 
        variant="h6" 
        gutterBottom 
        color="primary" 
        fontWeight="bold" 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1,
          borderBottom: `2px solid ${color}`,
          pb: 1,
          mb: 2
        }}
      >
        {icon}
        {title}
      </Typography>
      <List sx={{ maxHeight: 350, overflow: 'auto' }}>
        {players?.length > 0 ? (
          players.slice(0, 5).map((player, index) => (
            <ListItem 
              key={player._id} 
              sx={{ 
                py: 1.5,
                borderRadius: 1,
                mb: 1,
                backgroundColor: index === 0 ? 'rgba(255, 215, 0, 0.1)' : 
                                 index === 1 ? 'rgba(192, 192, 192, 0.1)' :
                                 index === 2 ? 'rgba(205, 127, 50, 0.1)' : 'transparent',
                border: index <= 2 ? `1px solid ${index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : '#CD7F32'}` : 'none'
              }}
            >
              <ListItemAvatar>
                <Avatar sx={{ 
                  bgcolor: index === 0 ? '#FFD700' : 
                           index === 1 ? '#C0C0C0' : 
                           index === 2 ? '#CD7F32' : color,
                  fontWeight: 'bold',
                  width: 32,
                  height: 32,
                  fontSize: '0.875rem'
                }}>
                  {index + 1}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Typography variant="subtitle2" fontWeight={index <= 2 ? 'bold' : 'normal'}>
                    {player.username}
                  </Typography>
                }
                secondary={
                  <Box display="flex" alignItems="center" gap={0.5} flexWrap="wrap" mt={0.5}>
                    <Chip 
                      label={`${player.totalPoints} pts`} 
                      size="small" 
                      color="primary" 
                      variant="outlined"
                      sx={{ fontSize: '0.7rem', height: 20 }}
                    />
                    <Chip 
                      label={player.rank} 
                      size="small" 
                      color="secondary"
                      sx={{ fontSize: '0.7rem', height: 20 }}
                    />
                    {player.completedGames && (
                      <Chip 
                        label={`${player.completedGames} completed`} 
                        size="small" 
                        color="success"
                        variant="outlined"
                        sx={{ fontSize: '0.7rem', height: 20 }}
                      />
                    )}
                    {player.imagesCreated && (
                      <Chip 
                        label={`${player.imagesCreated} images`} 
                        size="small" 
                        color="info"
                        variant="outlined"
                        sx={{ fontSize: '0.7rem', height: 20 }}
                      />
                    )}
                    {player.highestScore && (
                      <Chip 
                        label={`Best: ${player.highestScore}`} 
                        size="small" 
                        color="warning"
                        variant="outlined"
                        sx={{ fontSize: '0.7rem', height: 20 }}
                      />
                    )}
                  </Box>
                }
              />
            </ListItem>
          ))
        ) : (
          <Typography variant="body2" color="textSecondary" sx={{ p: 2, textAlign: 'center' }}>
            No player data available for this game
          </Typography>
        )}
      </List>
    </ChartContainer>
  );

  const gameData = [
    {
      players: userStats?.topCardPlayers,
      title: "Top Card Game Players",
      icon: <Casino sx={{ color: '#2196F3' }} />,
      color: '#2196F3'
    },
    {
      players: userStats?.topPuzzlePlayers,
      title: "Top Puzzle Game Players",
      icon: <Extension sx={{ color: '#4CAF50' }} />,
      color: '#4CAF50'
    },
    {
      players: userStats?.topMatchPlayers,
      title: "Top Match Game Players",
      icon: <SportsEsports sx={{ color: '#FF9800' }} />,
      color: '#FF9800'
    },
    {
      players: userStats?.topColorPlayers,
      title: "Top Color Game Players",
      icon: <Palette sx={{ color: '#9C27B0' }} />,
      color: '#9C27B0'
    }
  ];

  return (
    <ChartContainer>
      <Typography 
        variant="h5" 
        gutterBottom 
        color="primary" 
        fontWeight="bold" 
        sx={{ 
          mb: 3,
          textAlign: 'center',
          background: 'linear-gradient(45deg, #2196F3, #4CAF50)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}
      >
        🎮 Top Players by Web Game
      </Typography>
      
      <Grid container spacing={3}>
        {gameData.map((game, index) => (
          <Grid item xs={12} lg={6} key={index}>
            {renderGameLeaderboard(game.players, game.title, game.icon, game.color)}
          </Grid>
        ))}
      </Grid>
    </ChartContainer>
  );
};

export default GameLeaderboards;