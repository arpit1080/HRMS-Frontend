import React from 'react';
import { Link } from 'react-router-dom';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import EventNoteIcon from '@mui/icons-material/EventNote';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import AssessmentIcon from '@mui/icons-material/Assessment';
import '../css/Sidebar.css';

const Sidebar1 = () => {
  return (
    <div className="sidebar">
      <List>
        <ListItem button component={Link} to="/">
          <ListItemIcon><DashboardIcon /></ListItemIcon>
          <ListItemText primary="Dashboard" />
        </ListItem>
        <ListItem button component={Link} to="/employees">
          <ListItemIcon><PeopleIcon /></ListItemIcon>
          <ListItemText primary="Employees" />
        </ListItem>
        <ListItem button component={Link} to="/leaves">
          <ListItemIcon><EventNoteIcon /></ListItemIcon>
          <ListItemText primary="Leaves" />
        </ListItem>
        <ListItem button component={Link} to="/payroll">
          <ListItemIcon><AttachMoneyIcon /></ListItemIcon>
          <ListItemText primary="Payroll" />
        </ListItem>
        <ListItem button component={Link} to="/reports">
          <ListItemIcon><AssessmentIcon /></ListItemIcon>
          <ListItemText primary="Reports" />
        </ListItem>
      </List>
    </div>
  );
}

export default Sidebar1;
