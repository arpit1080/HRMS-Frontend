import React from 'react';
import { Grid, Paper, Typography } from '@mui/material';
import '../css/Dashboard.css';

const Dashboard1 = () => {
  return (
    <div className="dashboard">
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper className="paper">
            <Typography variant="h6">Total Employees</Typography>
            <Typography variant="h4">150</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper className="paper">
            <Typography variant="h6">Leaves Today</Typography>
            <Typography variant="h4">5</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper className="paper">
            <Typography variant="h6">Pending Approvals</Typography>
            <Typography variant="h4">10</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper className="paper">
            <Typography variant="h6">Monthly Payroll</Typography>
            <Typography variant="h4">$75,000</Typography>
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
}

export default Dashboard1;
