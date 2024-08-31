// LeaveForm.js
import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import { Form, Button, Container, Row, Col } from 'react-bootstrap';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { isTokenExpired } from './tokenUtils'; // Import the utility function
import '../css/LeaveForm.css'; // Import the CSS file

function LeaveForm() {
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [leaveType, setLeaveType] = useState('');
  const [reason, setReason] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
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

    axios.get('http://13.201.51.48:8000/leave/leave-types/', {
      headers: {
        "auth-token": token,
      },
    })
    .then(response => {
      setLeaveTypes(response.data);
    })
    .catch(error => {
      console.error('There was an error fetching the leave types!', error);
      Swal.fire({
        title: 'Error!',
        text: 'Failed to load leave types!',
        icon: 'error',
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
      });
    });
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

    if (!leaveType || !reason || !startDate || !endDate) {
      Swal.fire({
        title: 'Error!',
        text: 'All fields are required!',
        icon: 'error',
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
      });
      return;
    }

    const token = localStorage.getItem('accessToken'); // Fetch token from local storage
    const formData = {
      leave_type: leaveType,
      reason,
      start_date: startDate,
      end_date: endDate,
    };

    console.log('Form Data:', formData);

    axios.post('http://13.201.51.48:8000/leave/create/', formData, {
      headers: {
        "auth-token": token,
      },
    })
    .then(response => {
      console.log(response.data);
      Swal.fire({
        title: 'Success!',
        text: 'Form submitted successfully!',
        icon: 'success',
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
      }).then(() => {
        navigate('/leave');
      });
    })
    .catch(error => {
      console.error('There was an error!', error);
      Swal.fire({
        title: 'Error!',
        text: 'There was an error submitting the form!',
        icon: 'error',
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
      });
    });
  };

  if (tokenExpired) {
    return null; // Render nothing if token is expired
  }

  return (
    <div className="container">
      <div className="content">
        <Navbar showToggleButton={false} /> {/* Pass false to hide the toggle button */}
        <Container className="d-flex justify-content-center align-items-center min-vh-100">
          <div className="leave-form-container">
            <Form onSubmit={handleSubmit}>
              <Form.Group controlId="leaveType">
                <Form.Label>Leave Type</Form.Label>
                <Form.Control as="select" value={leaveType} onChange={(e) => setLeaveType(e.target.value)}>
                  <option value="">Select leave type</option>
                  {leaveTypes.map(type => (
                    <option key={type.leavetype_id} value={type.leavetype_id}>{type.name}</option>
                  ))}
                </Form.Control>
              </Form.Group>

              <Form.Group controlId="reason">
                <Form.Label>Reason</Form.Label>
                <Form.Control 
                  as="textarea" 
                  rows={3} 
                  value={reason} 
                  onChange={(e) => setReason(e.target.value)} 
                />
              </Form.Group>

              <Row>
                <Col>
                  <Form.Group controlId="startDate">
                    <Form.Label>Start Date</Form.Label>
                    <Form.Control 
                      type="date" 
                      value={startDate} 
                      onChange={(e) => setStartDate(e.target.value)} 
                    />
                  </Form.Group>
                </Col>
                <Col>
                  <Form.Group controlId="endDate">
                    <Form.Label>End Date</Form.Label>
                    <Form.Control 
                      type="date" 
                      value={endDate} 
                      onChange={(e) => setEndDate(e.target.value)} 
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Button variant="primary" type="submit" className="mt-3">
                Submit
              </Button>
            </Form>
          </div>
        </Container>
      </div>
    </div>
  );
}

export default LeaveForm;
