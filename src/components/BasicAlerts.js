import React from 'react';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Stack from '@mui/material/Stack';
import '../css/BasicAlerts.css'; // Import the CSS file for animations

const BasicAlerts = ({ severity, message, isVisible }) => {
  return (
    <Stack sx={{ width: '100%' }} spacing={2}>
      {isVisible && (
        <Alert
          severity={severity}
          className={`alert-message ${isVisible ? 'fade-in' : 'fade-out'}`}
        >
          <AlertTitle>{severity.charAt(0).toUpperCase() + severity.slice(1)}</AlertTitle>
          {message}
        </Alert>
      )}
    </Stack>
  );
};

export default BasicAlerts;
