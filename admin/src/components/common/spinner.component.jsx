import React from 'react';
import { CircularProgress } from '@mui/material';
import { SpinnerContainer } from '../../styles/auth/auth.style';

const AdminSpinner = ({ size = 60, color = '#2e7d32' }) => {
  return (
    <SpinnerContainer>
      <CircularProgress 
        size={size} 
        sx={{ 
          color: color,
          '& .MuiCircularProgress-circle': {
            strokeLinecap: 'round',
          }
        }} 
      />
    </SpinnerContainer>
  );
};

export default AdminSpinner;