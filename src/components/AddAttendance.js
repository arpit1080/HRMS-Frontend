import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/AddAttendance.css'; // Optional: For custom styles
import axios from 'axios';
import Swal from 'sweetalert2';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Import the CSS for react-toastify
import { isTokenExpired } from './tokenUtils'; // Import the utility function

const AddAttendance = () => {
    const [hasCheckedIn, setHasCheckedIn] = useState(null); // Initialize to null
    const [tokenExpired, setTokenExpired] = useState(false); // To manage token expiration
    const navigate = useNavigate();

    

    const showAlert = (type, message) => {
        switch (type) {
            case 'success':
                toast.success(message, { autoClose: 2000 });
                break;
            case 'info':
                toast.info(message, { autoClose: 2000 });
                break;
            case 'warning':
                toast.warn(message, { autoClose: 2000 });
                break;
            case 'error':
                toast.error(message, { autoClose: 2000 });
                break;
            default:
                break;
        }
    };

    useEffect(() => {
        if (isTokenExpired()) {
            setTokenExpired(true);
            Swal.fire({
                title: 'Session Expired',
                text: 'Your session has expired. Please log in again.',
                icon: 'error',
                confirmButtonText: 'Go to Login',
            }).then((result) => {
                if (result.isConfirmed) {
                    localStorage.clear(); // Clear local storage
                    navigate('/'); // Redirect to login page
                }
            });
            return;
        }
    }, [navigate]);

    const handleCheckIn = async () => {
        try {
            if (isTokenExpired()) {
                showAlert('error', 'Session expired. Please log in again.');
                return;
            }

            const token = localStorage.getItem('accessToken');
            if (!token) {
                showAlert('error', 'No access token found');
                return;
            }
            if (hasCheckedIn !== null) {
                showAlert('warning', 'You have already checked in today.');
                return;
            }
            const response = await axios.post(
                'http://13.201.51.48:8000/attendance/check_in/',
                {},
                {
                    headers: {
                        "auth-token": token,
                    },
                }
            );
            setHasCheckedIn(true);
            Swal.fire({
                position: "center",
                icon: "success",
                title: "Check-in successfully!",
                showConfirmButton: false,
                timer: 1500
              });
            setTimeout(() => navigate('/attendance'), 1500); // Navigate after the popup
        } catch (error) {
            showAlert('error', error.response?.data?.message || 'Error checking in. Please try again.');
        }
    };

    const handleCheckOut = async () => {
        try {
            if (isTokenExpired()) {
                showAlert('error', 'Session expired. Please log in again.');
                return;
            }

            const token = localStorage.getItem('accessToken');
            if (!token) {
                showAlert('error', 'No access token found');
                return;
            }
            if (hasCheckedIn !== null) {
                showAlert('warning', 'You need to check in before checking out.');
                return;
            }
            const response = await axios.post(
                'http://13.201.51.48:8000/attendance/check_out/',
                {},
                {
                    headers: {
                        "auth-token": token,
                    },
                }
            );
            setHasCheckedIn(false);
            Swal.fire({
                position: "center",
                icon: "success",
                title: "Check-out Successfully!",
                showConfirmButton: false,
                timer: 1500
              });
            setTimeout(() => navigate('/attendance'), 1500); // Navigate after the popup
        } catch (error) {
            showAlert('error', error.response?.data?.message || 'Error checking out. Please try again.');
        }
    };

    if (tokenExpired) {
        return null; // Optionally return null or a loading spinner
    }

    return (
        <div className="container pt-5">
                <Navbar/>
                <main className="mt-4 p-3 pt-4">
                    <div className="row mt-4">
                        <div className="col-md-6 mb-3">
                            <div className="card h-100">
                                <div className="card-body bg-success d-flex align-items-center justify-content-center">
                                    <button className="btn btn-success fw-bold w-100 h-100" onClick={handleCheckIn}>
                                        Check In
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-6 mb-3">
                            <div className="card h-100">
                                <div className="card-body bg-danger d-flex align-items-center justify-content-center">
                                    <button className="btn btn-danger fw-bold w-100 h-100" onClick={handleCheckOut}>
                                        Check Out
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <ToastContainer position="top-right" autoClose={2000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
                </main>
            </div>
    );
};

export default AddAttendance;
