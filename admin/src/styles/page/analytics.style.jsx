import { styled } from '@mui/material/styles';
import { Box, Paper, Card } from '@mui/material';

export const AnalyticsContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  backgroundColor: '#f8fafc',
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
}));

export const StatsCard = styled(Card)(({ theme }) => ({
  height: '140px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  padding: theme.spacing(2),
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
  boxShadow: '0 15px 35px rgba(0,0,0,0.2)',
  borderRadius: theme.spacing(2),
  transition: 'all 0.3s ease',
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-8px) scale(1.02)',
    boxShadow: '0 25px 50px rgba(0,0,0,0.3)'
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
    borderRadius: theme.spacing(2),
  }
}));

export const ChartContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  borderRadius: theme.spacing(2),
  boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
  background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
  border: '1px solid rgba(59, 130, 246, 0.1)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 20px 40px rgba(0,0,0,0.15)'
  }
}));

export const HeaderSection = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(4),
  padding: theme.spacing(4),
  background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
  borderRadius: theme.spacing(3),
  color: 'white',
  boxShadow: '0 15px 35px rgba(0,0,0,0.2)',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
    borderRadius: theme.spacing(3),
  },
  '& > *': {
    position: 'relative',
    zIndex: 1
  }
}));

export const StatNumber = styled('div')(({ theme }) => ({
  fontSize: '2.2rem',
  fontWeight: 'bold',
  marginBottom: theme.spacing(0.5),
  textShadow: '0 2px 4px rgba(0,0,0,0.3)'
}));

export const StatLabel = styled('div')(({ theme }) => ({
  fontSize: '0.85rem',
  opacity: 0.95,
  textTransform: 'uppercase',
  letterSpacing: '1px',
  fontWeight: '500',
  textAlign: 'center'
}));

export const SectionContainer = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(4),
  '& .MuiGrid-item': {
    height: '100%'
  }
}));

export const TabContainer = styled(Box)(({ theme }) => ({
  backgroundColor: 'white',
  borderRadius: theme.spacing(2),
  padding: theme.spacing(2),
  marginBottom: theme.spacing(3),
  boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
}));