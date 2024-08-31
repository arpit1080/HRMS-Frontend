import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import Swal from 'sweetalert2';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Tooltip } from 'react-tooltip';
import '../css/LoginPage.css';

// Import the image
import bgImage from '../media/4332392_18940.svg';

const LoginPage = () => {
    const navigate = useNavigate();
    const [tooltipEmail, setTooltipEmail] = useState('');
    const [tooltipPassword, setTooltipPassword] = useState('');

    const initialValues = {
        email_id: '',
        password: '',
    };

    const validationSchema = Yup.object({
        email_id: Yup.string().email('Invalid email format').required('Email is Required'),
        password: Yup.string().required('Password is Required'),
    });

    useEffect(() => {
        const prevEmail = localStorage.getItem('prevEmail');
        const prevPassword = localStorage.getItem('prevPassword');
        if (prevEmail) setTooltipEmail(prevEmail);
        if (prevPassword) setTooltipPassword(prevPassword);
    }, []);

    const onSubmit = async (values) => {
        try {
            const response = await axios.post('http://13.201.51.48:8000/user/login/', values);
            console.log('Login response', response.data);

            if (response.data && response.data.token && response.data.token.access) {
                localStorage.setItem('accessToken', response.data.token.access);
                localStorage.setItem('user', JSON.stringify(response.data.user));
                console.log('Access token and user data stored in local storage:', response.data.token.access, response.data.user);

                localStorage.setItem('prevEmail', values.email_id);
                localStorage.setItem('prevPassword', values.password);

                Swal.fire({
                    title: 'Login Successful!',
                    icon: 'success',
                    timer: 1500,
                    timerProgressBar: true,
                    showConfirmButton: false
                }).then(() => {
                    navigate('/dashboard');
                });
            } else {
                console.error('No access token found in response');
                Swal.fire({
                    title: 'Login Failed',
                    text: 'No access token found in response.',
                    icon: 'error'
                });
            }
        } catch (error) {
            console.error('Login error', error.response ? error.response.data : error.message);
            Swal.fire({
                title: 'Login Failed',
                timer: 2500,
                timerProgressBar: true,
                showConfirmButton: false,
                text: error.response?.data?.email_id || 'Please check your login credentials.',
                icon: 'error'
            });
        }
    };

    return (
        <div className="main-container">
            <div className="image-container">
                <img src={bgImage} alt="Background" />
            </div>
            <div className="form">
                <h2>Login</h2>
                <Formik
                    initialValues={initialValues}
                    validationSchema={validationSchema}
                    onSubmit={onSubmit}
                >
                    {formik => (
                        <Form>
                            <div className="form-group fw-bold">
                                <label htmlFor="email_id">Email</label>
                                <Field
                                    type="email"
                                    id="email_id"
                                    name="email_id"
                                    className={`form-control ${formik.touched.email_id && formik.errors.email_id ? 'is-invalid' : ''}`}
                                    data-tip={tooltipEmail}
                                />
                                <ErrorMessage name="email_id" component="div" className="invalid-feedback" />
                            </div>

                            <div className="form-group fw-bold mt-2">
                                <label htmlFor="password">Password</label>
                                <Field
                                    type="password"
                                    id="password"
                                    name="password"
                                    className={`form-control ${formik.touched.password && formik.errors.password ? 'is-invalid' : ''}`}
                                    data-tip={tooltipPassword}
                                />
                                <ErrorMessage name="password" component="div" className="invalid-feedback" />
                            </div>

                            <button type="submit" className="btn btn-primary mt-3">Login</button>
                        </Form>
                    )}
                </Formik>
                <Tooltip place="right" type="dark" effect="solid" />
            </div>
        </div>
    );
};

export default LoginPage;
