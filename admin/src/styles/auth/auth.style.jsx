import { styled } from '@mui/material/styles';
import { Box, Paper, TextField, Button, Typography, Alert } from '@mui/material';

export const AdminLoginContainer = styled(Box)(({ theme }) => ({
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 50%, #4caf50 100%)',
  padding: theme.spacing(2),
  overflow: 'hidden',
  zIndex: 1000,
}));

export const AdminLoginPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  width: '400px',
  minWidth: '400px',
  maxWidth: '400px',
  borderRadius: theme.spacing(3),
  backgroundColor: '#fafafa',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  position: 'relative',
  transform: 'none',
  '@media (max-width: 480px)': {
    width: '90vw',
    minWidth: '320px',
    maxWidth: '400px',
    padding: theme.spacing(3),
  },
}));

export const AdminFormField = styled(TextField)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  width: '100%',
  '& .MuiOutlinedInput-root': {
    fontSize: '16px',
    height: '56px',
    '&:hover fieldset': {
      borderColor: '#4caf50',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#2e7d32',
    },
  },
  '& .MuiInputLabel-root': {
    fontSize: '16px',
    '&.Mui-focused': {
      color: '#2e7d32',
    },
  },
  '& .MuiFormHelperText-root': {
    fontSize: '14px',
  },
}));

export const AdminHeaderBox = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  marginBottom: theme.spacing(3),
}));

export const AdminTitle = styled(Typography)(({ theme }) => ({
  color: '#1b5e20',
  fontWeight: 'bold',
  fontSize: '2rem',
  lineHeight: 1.2,
  '@media (max-width: 480px)': {
    fontSize: '1.75rem',
  },
}));

export const AdminSubtitle = styled(Typography)(({ theme }) => ({
  color: '#4caf50',
  marginTop: theme.spacing(1),
  fontSize: '0.875rem',
}));

export const AdminLoginButton = styled(Button)(({ theme }) => ({
  width: '100%',
  height: '48px',
  paddingTop: theme.spacing(1.5),
  paddingBottom: theme.spacing(1.5),
  backgroundColor: '#2e7d32',
  fontWeight: 'bold',
  fontSize: '1.1rem',
  borderRadius: theme.spacing(1),
  textTransform: 'none',
  '&:hover': {
    backgroundColor: '#1b5e20',
  },
  '&:disabled': {
    backgroundColor: '#a5d6a7',
  },
}));

export const AdminAlert = styled(Alert)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  fontSize: '14px',
}));

export const AdminCaption = styled(Typography)(({ theme }) => ({
  display: 'block',
  textAlign: 'center',
  marginTop: theme.spacing(2),
  color: '#666',
  fontSize: '0.75rem',
}));

export const AdminIconStyle = {
  fontSize: '48px',
  color: '#2e7d32',
  mb: 1,
};

// Spinner styles
export const SpinnerContainer = styled(Box)(({ theme }) => ({
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'rgba(46, 125, 50, 0.1)',
  zIndex: 2000,
}));