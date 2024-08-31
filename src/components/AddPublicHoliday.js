import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { Form, Button, Container } from 'react-bootstrap';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { isTokenExpired } from './tokenUtils'; // Import the utility function
import '../css/AddPublicHoliday.css'; // Import the CSS file

function AddPublicHoliday() {
  const [holidayName, setHolidayName] = useState('');
  const [holidayDate, setHolidayDate] = useState('');
  const [description, setDescription] = useState(''); // State for description
  const [tokenExpired, setTokenExpired] = useState(false); // State for token expiration check
  const navigate = useNavigate();


  useEffect(() => {
    const token = localStorage.getItem('accessToken'); // Fetch token from local storage

    if (isTokenExpired()) {
      setTokenExpired(true); // Set state to true if token is expired
      Swal.fire({
        icon: 'error',
        title: 'Session Expired!',
        text: 'Session has expired. Please log in again.',
        confirmButtonText: 'Go to Login',
      }).then(result => {
        if (result.isConfirmed) {
          localStorage.removeItem('accessToken');
          navigate('/');
        }
      });
      return;
    }
  }, [navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (isTokenExpired()) {
      Swal.fire({
        icon: 'error',
        title: 'Session Expired!',
        text: 'Session has expired. Please log in again.',
        confirmButtonText: 'Go to Login',
      }).then(result => {
        if (result.isConfirmed) {
          localStorage.removeItem('accessToken');
          navigate('/');
        }
      });
      return;
    }

    const token = localStorage.getItem('accessToken'); // Fetch token from local storage
    const formData = {
      name: holidayName,
      date: holidayDate,
      description, // Include description in form data
    };

    axios.post('http://13.201.51.48:8000/publicholiday/create/', formData, {
      headers: {
        "auth-token": token,
      },
    })
    .then(response => {
      Swal.fire({
        title: 'Success!',
        text: 'Public holiday added successfully!',
        icon: 'success',
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
      }).then(() => {
        setTimeout(() => {
          navigate('/publicholiday');
        }); // Delay navigation by 2 seconds
      });
    })
    .catch(error => {
      console.error('Error details:', error.response ? error.response.data : error.message);
      Swal.fire({
        title: 'Error!',
        text: error.response ? error.response.data.detail || 'There was an error adding the public holiday!' : 'An unexpected error occurred!',
        icon: 'error',
        timer: 1000,
        timerProgressBar: true,
        showConfirmButton: false,
      });
    });
  };


  if (tokenExpired) {
    return null; // Render nothing if token is expired
  }

  return (
    <div className="container-fluid">
        <Navbar />
        <Container className="d-flex justify-content-center align-items-center min-vh-100">
          <div className="add-public-holiday-form-container">
            <Form onSubmit={handleSubmit}>
              <Form.Group controlId="holidayName">
                <Form.Label>Holiday Name</Form.Label>
                <Form.Control 
                  type="text" 
                  value={holidayName} 
                  onChange={(e) => setHolidayName(e.target.value)} 
                  placeholder="Enter holiday name" 
                />
              </Form.Group>

              <Form.Group controlId="holidayDate" className="mt-3">
                <Form.Label>Holiday Date</Form.Label>
                <Form.Control 
                  type="date" 
                  value={holidayDate} 
                  onChange={(e) => setHolidayDate(e.target.value)} 
                />
              </Form.Group>

              <Form.Group controlId="description" className="mt-3">
                <Form.Label>Description</Form.Label>
                <Form.Control 
                  as="textarea" 
                  rows={3} 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                  placeholder="Enter a description (optional)" 
                />
              </Form.Group>

              <Button variant="primary" type="submit" className="mt-3">
                Add Holiday
              </Button>
            </Form>
          </div>
        </Container>
      </div>
  );
}

export default AddPublicHoliday;
