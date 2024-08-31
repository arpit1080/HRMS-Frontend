import React, { useState } from 'react';
import { Nav } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import '../css/Sidebar.css';

const Sidebar = ({ isOpen, toggleSidebar, isSuperadmin }) => {
    const [isHRMSOpen, setHRMSOpen] = useState(false);
    const navigate = useNavigate();

    const toggleHRMS = () => {
        setHRMSOpen(!isHRMSOpen);
    };

    const handleLogout = () => {
        // Clear local storage
        localStorage.clear();
        // Redirect to login page or home page
        navigate('/'); // Adjust the path as needed
    };

    return (
        <div
            className={`sidebar ${isOpen ? "sidebar-open" : "sidebar-closed"} pt-3`}
        >
            <Nav className="flex-column">
                <Nav.Link href="/dashboard" className="text-light ms-3">
                    Dashboard
                </Nav.Link>
                <Nav.Link
                    onClick={toggleHRMS}
                    className="d-flex justify-content-between text-light ms-3"
                >
                    HRMS{" "}
                    <span className={`ms-auto ${isHRMSOpen ? "rotate-icon" : ""}`}>
                        <i className={`bi bi-chevron-${isHRMSOpen ? "up" : "down"}`}></i>
                    </span>
                </Nav.Link>
                {isHRMSOpen && (
                    <div className="ms-3">
                        <Nav.Link href="/employee" className="text-light ms-4">
                            Employee
                        </Nav.Link>
                        <Nav.Link href="/attendance" className="text-light ms-4">
                            Attendance
                        </Nav.Link>
                        <Nav.Link href="/leave" className="text-light ms-4">
                            Leave
                        </Nav.Link>
                        {isSuperadmin && (
                            <Nav.Link href="/publicholiday" className="text-light ms-4">
                                Publicholiday
                            </Nav.Link>
                        )}
                    </div>
                )}
                <Nav.Link onClick={handleLogout} className="text-light ms-3">
                    Logout
                </Nav.Link>
            </Nav>
        </div>
    );
};

export default Sidebar;
