import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import '../css/Navbar.css';

const Navbar1 = () => {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          HR Management System
        </Typography>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar1;
