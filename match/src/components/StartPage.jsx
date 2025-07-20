import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Container, IconButton, Typography, Button } from '@mui/material'
import SettingsIcon from '@mui/icons-material/Settings'
import Settings from './Settings'

const StartPage = () => {
  const navigate = useNavigate()
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [difficulty, setDifficulty] = useState('easy')
  const [isHovered, setIsHovered] = useState(false)
  const [hoveredDifficulty, setHoveredDifficulty] = useState('')

  const handleOpenSettings = () => setSettingsOpen(true)
  const handleCloseSettings = () => setSettingsOpen(false)

  const handleStartGame = () => {
    navigate('/game', { state: { difficulty } })
  }

  const getDifficultyColors = (level) => {
    if (difficulty === level) {
      return {
        bg: '#00FF7F',
        border: '#008B45',
        text: '#FFFFFF',
        shadow: '#006B3A'
      }
    }
    return {
      bg: '#87CEEB',
      border: '#4682B4',
      text: '#FFFFFF',
      shadow: '#2F4F4F'
    }
  }

  const getDifficultyLabel = (level) => {
    switch(level) {
      case 'easy': return 'EASY'
      case 'medium': return 'MEDIUM'
      case 'hard': return 'HARD'
      default: return level.toUpperCase()
    }
  }

  return (
    <Box sx={{ 
      position: 'relative', 
      minHeight: '100vh',
      backgroundImage: 'url(/assets/game_images/forest.gif)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat' 
    }}>
      <IconButton
        aria-label="settings"
        onClick={handleOpenSettings}
        sx={{
          position: 'fixed',
          top: 16,
          right: 16,
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.9)'
          },
          zIndex: 1000
        }}
      >
        <SettingsIcon />
      </IconButton>

      <Settings 
        open={settingsOpen} 
        onClose={handleCloseSettings}
      />

      <Container maxWidth="sm">
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 4,
            py: 4
          }}
        >
          {/* Custom 8-bit Beach Match Title */}
          <Box
            sx={{
              position: 'relative',
              marginBottom: 4,
              marginTop: -8,
              textAlign: 'center'
            }}
          >
            <Typography
              variant="h1"
              sx={{
                fontFamily: 'monospace',
                fontSize: { xs: '3rem', sm: '4rem', md: '5rem' },
                fontWeight: 'bold',
                color: '#FF6B35',
                textShadow: `
                  4px 0px 0px #FF4500,
                  -4px 0px 0px #FF4500,
                  0px 4px 0px #FF4500,
                  0px -4px 0px #FF4500,
                  4px 4px 0px #B22222,
                  -4px -4px 0px #B22222,
                  4px -4px 0px #B22222,
                  -4px 4px 0px #B22222,
                  8px 8px 0px rgba(0,0,0,0.3)
                `,
                letterSpacing: '4px',
                animation: 'float 3s ease-in-out infinite',
                '@keyframes float': {
                  '0%, 100%': { transform: 'translateY(0px)' },
                  '50%': { transform: 'translateY(-10px)' }
                },
                background: 'linear-gradient(45deg, #FFD700, #FF6B35, #40E0D0)',
                backgroundSize: '200% 200%',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                animationName: 'gradientShift, float',
                animationDuration: '4s, 3s',
                animationIterationCount: 'infinite, infinite',
                '@keyframes gradientShift': {
                  '0%': { backgroundPosition: '0% 50%' },
                  '50%': { backgroundPosition: '100% 50%' },
                  '100%': { backgroundPosition: '0% 50%' }
                }
              }}
            >
              BEACH
            </Typography>
            <Typography
              variant="h1"
              sx={{
                fontFamily: 'monospace',
                fontSize: { xs: '3rem', sm: '4rem', md: '5rem' },
                fontWeight: 'bold',
                color: '#40E0D0',
                textShadow: `
                  4px 0px 0px #20B2AA,
                  -4px 0px 0px #20B2AA,
                  0px 4px 0px #20B2AA,
                  0px -4px 0px #20B2AA,
                  4px 4px 0px #008B8B,
                  -4px -4px 0px #008B8B,
                  4px -4px 0px #008B8B,
                  -4px 4px 0px #008B8B,
                  8px 8px 0px rgba(0,0,0,0.3)
                `,
                letterSpacing: '4px',
                marginTop: '-10px',
                animation: 'float 3s ease-in-out infinite 0.5s',
                background: 'linear-gradient(45deg, #40E0D0, #FFD700, #FF6B35)',
                backgroundSize: '200% 200%',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                animationName: 'gradientShift, float',
                animationDuration: '4s, 3s',
                animationIterationCount: 'infinite, infinite',
                animationDelay: '0s, 0.5s'
              }}
            >
              MATCH
            </Typography>
          </Box>
          
          {/* Custom 8-bit Difficulty Buttons */}
          <Box sx={{ 
            display: 'flex', 
            gap: 3, 
            justifyContent: 'center',
            mb: 4,
            flexWrap: 'wrap'
          }}>
            {['easy', 'medium', 'hard'].map((level) => {
              const colors = getDifficultyColors(level);
              const isSelected = difficulty === level;
              const isHovering = hoveredDifficulty === level;
              
              return (
                <Button
                  key={level}
                  onClick={() => setDifficulty(level)}
                  onMouseEnter={() => setHoveredDifficulty(level)}
                  onMouseLeave={() => setHoveredDifficulty('')}
                  sx={{
                    fontFamily: 'monospace',
                    fontSize: '1.2rem',
                    fontWeight: 'bold',
                    padding: '12px 24px',
                    minWidth: '120px',
                    backgroundColor: isSelected ? colors.bg : (isHovering ? '#FFD700' : colors.bg),
                    color: isSelected ? colors.text : (isHovering ? '#FF4500' : colors.text),
                    border: `3px solid ${colors.border}`,
                    borderRadius: '0px',
                    boxShadow: isSelected ? 
                      `6px 6px 0px ${colors.shadow}, 10px 10px 0px rgba(0,0,0,0.4)` :
                      `4px 4px 0px ${colors.shadow}, 6px 6px 0px rgba(0,0,0,0.3)`,
                    textShadow: isSelected ? 
                      '2px 2px 0px rgba(0,0,0,0.7)' : 
                      '1px 1px 0px rgba(0,0,0,0.5)',
                    letterSpacing: '1px',
                    transform: isSelected ? 
                      'translate(-2px, -2px) scale(1.05)' : 
                      (isHovering ? 'translate(-1px, -1px)' : 'translate(0px, 0px)'),
                    transition: 'all 0.15s ease',
                    position: 'relative',
                    overflow: 'hidden',
                    '&:hover': {
                      backgroundColor: isSelected ? colors.bg : '#FFD700',
                      transform: isSelected ? 
                        'translate(-2px, -2px) scale(1.05)' : 
                        'translate(-1px, -1px)',
                      boxShadow: isSelected ? 
                        `6px 6px 0px ${colors.shadow}, 10px 10px 0px rgba(0,0,0,0.4)` :
                        `5px 5px 0px ${colors.shadow}, 8px 8px 0px rgba(0,0,0,0.3)`,
                    },
                    '&:active': {
                      transform: 'translate(1px, 1px)',
                      boxShadow: `2px 2px 0px ${colors.shadow}, 4px 4px 0px rgba(0,0,0,0.3)`,
                    },
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: isSelected ? 
                        'linear-gradient(45deg, rgba(255,255,255,0.3) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0.3) 75%, transparent 75%)' :
                        'none',
                      backgroundSize: '6px 6px',
                      animation: isSelected ? 'pixelGlow 1s linear infinite' : 'none',
                      '@keyframes pixelGlow': {
                        '0%': { transform: 'translateX(-6px)' },
                        '100%': { transform: 'translateX(0px)' }
                      }
                    }
                  }}
                >
                  {getDifficultyLabel(level)}
                </Button>
              );
            })}
          </Box>

          {/* Custom 8-bit Beach Style Start Button */}
          <Button
            onClick={handleStartGame}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            sx={{
              fontFamily: 'monospace',
              fontSize: '1.5rem',
              fontWeight: 'bold',
              padding: '16px 32px',
              backgroundColor: isHovered ? '#FF6B35' : '#FFD700',
              color: isHovered ? '#FFFFFF' : '#FF4500',
              border: '4px solid #FF4500',
              borderRadius: '0px',
              boxShadow: `
                4px 4px 0px #B22222,
                8px 8px 0px rgba(0,0,0,0.3)
              `,
              textShadow: isHovered ? 
                '2px 2px 0px rgba(0,0,0,0.5)' : 
                '2px 2px 0px #FFB347',
              letterSpacing: '2px',
              transform: isHovered ? 'translate(-2px, -2px)' : 'translate(0px, 0px)',
              transition: 'all 0.1s ease',
              position: 'relative',
              overflow: 'hidden',
              '&:hover': {
                backgroundColor: '#FF6B35',
                boxShadow: `
                  6px 6px 0px #B22222,
                  10px 10px 0px rgba(0,0,0,0.3)
                `,
              },
              '&:active': {
                transform: 'translate(2px, 2px)',
                boxShadow: `
                  2px 2px 0px #B22222,
                  4px 4px 0px rgba(0,0,0,0.3)
                `,
              },
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: isHovered ? 
                  'linear-gradient(45deg, rgba(255,255,255,0.2) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.2) 75%, transparent 75%)' :
                  'none',
                backgroundSize: '8px 8px',
                animation: isHovered ? 'pixelMove 0.5s linear infinite' : 'none',
                '@keyframes pixelMove': {
                  '0%': { transform: 'translateX(-8px)' },
                  '100%': { transform: 'translateX(0px)' }
                }
              }
            }}
          >
            START GAME
          </Button>
          
        </Box>
      </Container>
    </Box>
  )
}

export default StartPage