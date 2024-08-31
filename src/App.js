// src/App.js
import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import Employee from './components/Employee';
import AddEmployee from './components/AddEmployee';
import Attendance from './components/Attendance';
import Leave from './components/Leave';
import LeaveForm from './components/LeaveForm';
import AddAttendance from './components/AddAttendance';
import AddPublicHoliday from './components/AddPublicHoliday';
import PublicHoliday from './components/PublicHoliday';

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<LoginPage />} />
                <Route 
                    path="/dashboard" 
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    } 
                />
                <Route 
                    path="/employee" 
                    element={
                        <ProtectedRoute>
                            <Employee />
                        </ProtectedRoute>
                    } 
                />
                <Route 
                    path="/addemployee" 
                    element={
                        <ProtectedRoute>
                            <AddEmployee />
                        </ProtectedRoute>
                    } 
                />
                <Route 
                    path="/attendance" 
                    element={
                        <ProtectedRoute>
                            <Attendance />
                        </ProtectedRoute>
                    } 
                />
                <Route 
                    path="/addattendance" 
                    element={
                        <ProtectedRoute>
                            <AddAttendance />
                        </ProtectedRoute>
                    } 
                />
            
                <Route 
                    path="/leave" 
                    element={
                        <ProtectedRoute>
                            <Leave />
                        </ProtectedRoute>
                    } 
                />
                <Route 
                    path="/leaveform" 
                    element={
                        <ProtectedRoute>
                            <LeaveForm />
                        </ProtectedRoute>
                    } 
                />
                <Route 
                    path="/publicholiday" 
                    element={
                        <ProtectedRoute>
                            <PublicHoliday />
                        </ProtectedRoute>
                    } 
                />
                <Route 
                    path="/addpublicholiday" 
                    element={
                        <ProtectedRoute>
                            <AddPublicHoliday />
                        </ProtectedRoute>
                    } 
                />
            </Routes>
        </Router>
    );
};

export default App;
