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
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Card,
  CardContent
} from '@mui/material';
import { ExpandMore, EmojiEvents, TrendingUp } from '@mui/icons-material';
import { ChartContainer } from '../../../styles/page/analytics.style';

const LevelLeaderboards = ({ userStats }) => {
  const renderLevelLeaderboard = (levelId, players) => (
    <Card key={levelId} sx={{ mb: 2, boxShadow: 2 }}>
      <CardContent>
        <Typography 
          variant="h6" 
          gutterBottom 
          color="primary" 
          fontWeight="bold" 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1,
            borderBottom: '2px solid #FFD700',
            pb: 1
          }}
        >
          <EmojiEvents sx={{ color: '#FFD700' }} />
          Level {levelId} Leaderboard
        </Typography>
        <List>
          {players?.length > 0 ? (
            players.slice(0, 5).map((player, index) => (
              <ListItem 
                key={player._id} 
                sx={{ 
                  py: 1,
                  borderRadius: 1,
                  backgroundColor: index === 0 ? 'rgba(255, 215, 0, 0.1)' : 'transparent'
                }}
              >
                <ListItemAvatar>
                  <Avatar sx={{ 
                    bgcolor: index === 0 ? '#FFD700' : 
                             index === 1 ? '#C0C0C0' : 
                             index === 2 ? '#CD7F32' : '#3B82F6',
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
                    <Typography variant="subtitle2" fontWeight={index === 0 ? 'bold' : 'normal'}>
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
                      <Chip 
                        label={`${player.completionsCount} completions`} 
                        size="small" 
                        color="success"
                        variant="outlined"
                        sx={{ fontSize: '0.7rem', height: 20 }}
                      />
                    </Box>
                  }
                />
              </ListItem>
            ))
          ) : (
            <Typography variant="body2" color="textSecondary" sx={{ p: 2, textAlign: 'center' }}>
              No completions for this level yet
            </Typography>
          )}
        </List>
      </CardContent>
    </Card>
  );

  const renderTopLevelPlayers = () => (
    <ChartContainer>
      <Typography 
        variant="h6" 
        gutterBottom 
        color="primary" 
        fontWeight="bold"
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1,
          borderBottom: '2px solid #3B82F6',
          pb: 1,
          mb: 2
        }}
      >
        <TrendingUp sx={{ color: '#3B82F6' }} />
        🏆 Top Level Players (All Levels)
      </Typography>
      <List sx={{ maxHeight: 400, overflow: 'auto' }}>
        {userStats?.topLevelPlayers?.length > 0 ? (
          userStats.topLevelPlayers.slice(0, 10).map((player, index) => (
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
                           index === 2 ? '#CD7F32' : '#3B82F6',
                  fontWeight: 'bold',
                  width: 36,
                  height: 36
                }}>
                  {index + 1}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Typography variant="subtitle1" fontWeight={index <= 2 ? 'bold' : 'normal'}>
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
          <Typography variant="body2" color="textSecondary" sx={{ p: 2, textAlign: 'center' }}>
            No level completion data available
          </Typography>
        )}
      </List>
    </ChartContainer>
  );

  return (
    <>
      {/* Top Level Players */}
      <Grid item xs={12} lg={6}>
        {renderTopLevelPlayers()}
      </Grid>

      {/* Level Statistics */}
      <Grid item xs={12} lg={6}>
        <ChartContainer>
          <Typography 
            variant="h6" 
            gutterBottom 
            color="primary" 
            fontWeight="bold"
            sx={{ 
              borderBottom: '2px solid #9C27B0',
              pb: 1,
              mb: 2
            }}
          >
            📊 Level Completion Statistics
          </Typography>
          <List sx={{ maxHeight: 400, overflow: 'auto' }}>
            {userStats?.levelStats?.slice(0, 10).map((stat, index) => (
              <ListItem key={stat._id} sx={{ py: 1, borderRadius: 1, mb: 1 }}>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: '#9C27B0', fontWeight: 'bold', width: 32, height: 32 }}>
                    L{stat._id}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={`Level ${stat._id}`}
                  secondary={
                    <Box display="flex" alignItems="center" gap={0.5} flexWrap="wrap" mt={0.5}>
                      <Chip 
                        label={`${stat.totalCompletions} completions`} 
                        size="small" 
                        color="primary" 
                        variant="outlined"
                        sx={{ fontSize: '0.7rem', height: 20 }}
                      />
                      <Chip 
                        label={`${stat.uniquePlayersCount} players`} 
                        size="small" 
                        color="secondary"
                        variant="outlined"
                        sx={{ fontSize: '0.7rem', height: 20 }}
                      />
                      <Chip 
                        label={`${Math.round(stat.averagePoints)} avg pts`} 
                        size="small" 
                        color="success"
                        variant="outlined"
                        sx={{ fontSize: '0.7rem', height: 20 }}
                      />
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        </ChartContainer>
      </Grid>

      {/* Level-Specific Leaderboards */}
      <Grid item xs={12}>
        <ChartContainer>
          <Typography 
            variant="h6" 
            gutterBottom 
            color="primary" 
            fontWeight="bold" 
            sx={{ mb: 3, textAlign: 'center' }}
          >
            🎯 Level-Specific Leaderboards
          </Typography>
          
          {userStats?.levelLeaderboards && Object.keys(userStats.levelLeaderboards).length > 0 ? (
            <Accordion>
              <AccordionSummary 
                expandIcon={<ExpandMore />}
                sx={{ 
                  backgroundColor: 'rgba(59, 130, 246, 0.05)',
                  borderRadius: 1,
                  mb: 1
                }}
              >
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
            <Typography variant="body2" color="textSecondary" sx={{ p: 2, textAlign: 'center' }}>
              No level leaderboard data available
            </Typography>
          )}
        </ChartContainer>
      </Grid>
    </>
  );
};

export default LevelLeaderboards;