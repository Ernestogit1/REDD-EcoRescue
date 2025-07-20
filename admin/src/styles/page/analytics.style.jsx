import { styled } from '@mui/material/styles';
import { Box, Paper, Card } from '@mui/material';

export const AnalyticsContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  backgroundColor: '#f8fafc',
  minHeight: '100vh'
}));

export const StatsCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  padding: theme.spacing(3),
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
  boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
  borderRadius: theme.spacing(2),
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 20px 40px rgba(0,0,0,0.15)'
  }
}));

export const ChartContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  borderRadius: theme.spacing(2),
  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
  background: 'white',
  border: '1px solid rgba(255,255,255,0.2)'
}));

export const HeaderSection = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(4),
  padding: theme.spacing(3),
  background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
  borderRadius: theme.spacing(2),
  color: 'white',
  boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
}));

export const StatNumber = styled('div')(({ theme }) => ({
  fontSize: '2.5rem',
  fontWeight: 'bold',
  marginBottom: theme.spacing(1)
}));

export const StatLabel = styled('div')(({ theme }) => ({
  fontSize: '0.9rem',
  opacity: 0.9,
  textTransform: 'uppercase',
  letterSpacing: '1px'
}));