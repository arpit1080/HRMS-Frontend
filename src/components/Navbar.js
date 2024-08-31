// NavBar.js
import React, { useState, useEffect } from 'react';
import { Button } from 'react-bootstrap';
import { MdOutlineDensityMedium } from 'react-icons/md';
import { useLocation } from 'react-router-dom';
import '../css/Navbar.css'; // Import your custom CSS file if needed

const Navbar = ({ toggleSidebar }) => {
    const [username, setUsername] = useState('');
    const location = useLocation();

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user) {
            setUsername(user.fullname);
        }
    }, []);

    // Check if the current route is one of the specified routes
    const hideToggleButtonRoutes = ['/leaveform', '/addemployee', '/addattendance', '/addpublicholiday'];
    const showToggleButton = !hideToggleButtonRoutes.includes(location.pathname);

    return (
        <nav className="navbar navbar-expand-lg navbar-primary fixed-top">
            <div className="container-fluid">
                {showToggleButton && (
                    <Button
                        className="sidebar-toggle-button me-3"
                        variant="outline-light"
                        onClick={toggleSidebar}
                    >
                        <MdOutlineDensityMedium size={24} />
                    </Button>
                )}
                <a className="navbar-brand" href="/dashboard">
                    Dashboard
                </a>
                <div className="collapse navbar-collapse">
                    <div className="ms-auto">
                        <span className="navbar-text">
                            {username}
                        </span>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
 