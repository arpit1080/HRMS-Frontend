import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/Dashboard.css';

const Dashboard = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [fullName, setFullName] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user) {
            setFullName(user.fullname);
        }
    }, []);

    const user = JSON.parse(localStorage.getItem('user'));
    const is_superadmin = user?.is_superadmin;

    const toggleSidebar = () => {
        setIsSidebarOpen(prevState => !prevState);
    };

    const handleNavigate = (path) => {
        navigate(path);
    };

    return (
        <div className="container">
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} isSuperadmin={user.is_superadmin} />
            <div className={`content ${isSidebarOpen ? 'content-expanded' : 'content-collapsed'}`}>
                <Navbar toggleSidebar={toggleSidebar} />
                <main className="mt-4 p-3">
                    <h2 className='pt-3 text-primary'>Welcome to Resolab, {fullName}!</h2>
                    <div className="row mt-4">
                        <div className="col-md-6 mb-3">
                            <div 
                                className="card h-100 cursor-pointer" 
                                onClick={() => handleNavigate('/leave')}
                            >
                                <div className="card-body d-flex align-items-center justify-content-center">
                                    <h5 className="text-black fw-bold">Create Leave</h5>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-6 mb-3">
                            <div 
                                className="card h-100 cursor-pointer" 
                                onClick={() => handleNavigate('/attendance')}
                            >
                                <div className="card-body d-flex align-items-center justify-content-center">
                                    <h5 className="text-black fw-bold">Add Attendance</h5>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Dashboard;
