import { styled } from '@mui/material/styles';
import { Box, AppBar, Card, Button, Typography } from '@mui/material';

export const DashboardContainer = styled(Box)({
  width: '100vw',
  minHeight: '100vh',
  position: 'relative',
  overflow: 'hidden',
});

export const DashboardAppBar = styled(AppBar)({
  backgroundColor: '#2e7d32',
  position: 'static',
  height: '64px',
  '& .MuiToolbar-root': {
    height: '64px',
    minHeight: '64px',
    paddingLeft: '24px',
    paddingRight: '24px',
  },
});

export const DashboardContent = styled(Box)({
  padding: '24px',
  backgroundColor: '#f5f5f5',
  minHeight: 'calc(100vh - 64px)',
  width: '100%',
  boxSizing: 'border-box',
});

export const DashboardTitle = styled(Typography)({
  marginBottom: '24px',
  color: '#1b5e20',
  fontWeight: 'bold',
  fontSize: '2rem',
  lineHeight: 1.2,
});

export const DashboardCard = styled(Card)({
  backgroundColor: '#e8f5e8',
  height: '200px',
  display: 'flex',
  flexDirection: 'column',
  '& .MuiCardContent-root': {
    padding: '24px',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
});

export const DashboardButton = styled(Button)({
  backgroundColor: '#2e7d32',
  color: 'white',
  fontSize: '0.875rem',
  fontWeight: 500,
  padding: '8px 16px',
  borderRadius: '6px',
  textTransform: 'none',
  width: 'fit-content',
  '&:hover': {
    backgroundColor: '#1b5e20',
  },
});

export const DashboardCardTitle = styled(Typography)({
  color: '#1b5e20',
  fontSize: '1.25rem',
  fontWeight: 600,
  lineHeight: 1.2,
});

export const DashboardCardDescription = styled(Typography)({
  color: '#666',
  fontSize: '0.875rem',
  lineHeight: 1.4,
  marginBottom: '16px',
});

export const DashboardTestPaper = styled(Box)({
  padding: '24px',
  backgroundColor: '#ffffff',
  borderRadius: '8px',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
});

export const UserWelcomeText = styled(Typography)({
  fontSize: '0.875rem',
  color: 'white',
  marginRight: '16px',
});