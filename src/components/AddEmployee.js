import React, { useState } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import Swal from "sweetalert2";
import "bootstrap/dist/css/bootstrap.min.css";
import '../css/AddEmployee.css'; // Import the CSS file
import { useNavigate } from "react-router-dom";

const AddEmployee = () => {

  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      email_id: "",
      mobile_number: "",
      address: "",
      state: "",
      district: "",
      birthdate: "",
      fullname: "",
      password: "",
      confirmPassword: "",
      work_type: "",  // New field for work type
    },
    validationSchema: Yup.object({
      email_id: Yup.string()
        .email("Invalid email address")
        .required("Required"),
      mobile_number: Yup.string().required("Required"),
      address: Yup.string().required("Required"),
      state: Yup.string().required("Required"),
      district: Yup.string().required("Required"),
      birthdate: Yup.date().required("Required"),
      fullname: Yup.string().required("Required"),
      password: Yup.string()
        .min(6, "Password must be at least 6 characters")
        .required("Required"),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref("password"), null], "Passwords must match")
        .required("Required"),
      work_type: Yup.string().required("Required"),  // Validation for work type
    }),
    
    onSubmit: async (values) => {
      const { confirmPassword, ...formData } = values;
      console.log("Form Data:", formData);  // Log the formData to inspect it
    
      const token = localStorage.getItem("accessToken");
    
      if (!token) {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "No token provided!",
        });
        return;
      }
    
      try {
        const response = await axios.post(
          "http://13.201.51.48:8000/user/create_user/",
          formData,
          {
            headers: {
              "auth-token": token,
            },
          }
        );
        Swal.fire({
          icon: "success",
          title: "User created successfully",
          timer: 2000,
          showConfirmButton: false,
        }).then(() => {
          navigate('/employee');
          formik.resetForm();
        });
      } catch (error) {
        console.error("API Error:", error.response);  // Log the error response for more details
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.response ? error.response.data.message : error.message,
        });
      }
    },
      });

  return (
    <div className="container-fluid mt-5">
        <Navbar />
        <div className="d-flex justify-content-center align-items-center min-vh-100">
          <div className="form-container">
            <h2>Add Employee Details</h2>
            <hr />
            <form
              onSubmit={formik.handleSubmit}
              className="needs-validation"
              noValidate
            >

              <div className="mb-3">
                <label htmlFor="work_type" className="form-label">
                  Type
                </label>
                <select
                  id="work_type"
                  name="work_type"
                  className={`form-control ${
                    formik.touched.work_type && formik.errors.work_type
                      ? "is-invalid"
                      : ""
                  }`}
                  {...formik.getFieldProps("work_type")}
                >
                  <option value="">Select Work Type</option>
                  <option value="OFFICE">OFFICE</option>
                  <option value="FIELD">FIELD</option>
                  <option value="BOTH">BOTH</option>
                </select>
                {formik.touched.work_type && formik.errors.work_type ? (
                  <div className="invalid-feedback">{formik.errors.work_type}</div>
                ) : null}
              </div>

              <div className="mb-3">
                <label htmlFor="fullname" className="form-label">
                  Employee Name
                </label>
                <input
                  type="text"
                  id="fullname"
                  name="fullname"
                  className={`form-control ${
                    formik.touched.fullname && formik.errors.fullname
                      ? "is-invalid"
                      : ""
                  }`}
                  {...formik.getFieldProps("fullname")}
                />
                {formik.touched.fullname && formik.errors.fullname ? (
                  <div className="invalid-feedback">{formik.errors.fullname}</div>
                ) : null}
              </div>

              <div className="mb-3">
                <label htmlFor="email_id" className="form-label">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email_id"
                  name="email_id"
                  className={`form-control ${
                    formik.touched.email_id && formik.errors.email_id
                      ? "is-invalid"
                      : ""
                  }`}
                  {...formik.getFieldProps("email_id")}
                />
                {formik.touched.email_id && formik.errors.email_id ? (
                  <div className="invalid-feedback">{formik.errors.email_id}</div>
                ) : null}
              </div>

              <div className="mb-3">
                <label htmlFor="mobile_number" className="form-label">
                  Mobile Number
                </label>
                <input
                  type="text"
                  id="mobile_number"
                  name="mobile_number"
                  className={`form-control ${
                    formik.touched.mobile_number && formik.errors.mobile_number
                      ? "is-invalid"
                      : ""
                  }`}
                  {...formik.getFieldProps("mobile_number")}
                />
                {formik.touched.mobile_number && formik.errors.mobile_number ? (
                  <div className="invalid-feedback">{formik.errors.mobile_number}</div>
                ) : null}
              </div>

              <div className="mb-3">
                <label htmlFor="birthdate" className="form-label">
                  Birthdate
                </label>
                <input
                  type="date"
                  id="birthdate"
                  name="birthdate"
                  className={`form-control ${
                    formik.touched.birthdate && formik.errors.birthdate
                      ? "is-invalid"
                      : ""
                  }`}
                  {...formik.getFieldProps("birthdate")}
                />
                {formik.touched.birthdate && formik.errors.birthdate ? (
                  <div className="invalid-feedback">{formik.errors.birthdate}</div>
                ) : null}
              </div>

              <div className="mb-3">
                <label htmlFor="address" className="form-label">
                  Address
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  className={`form-control ${
                    formik.touched.address && formik.errors.address
                      ? "is-invalid"
                      : ""
                  }`}
                  {...formik.getFieldProps("address")}
                />
                {formik.touched.address && formik.errors.address ? (
                  <div className="invalid-feedback">{formik.errors.address}</div>
                ) : null}
              </div>

              <div className="mb-3">
                <label htmlFor="district" className="form-label">
                  District
                </label>
                <input
                  type="text"
                  id="district"
                  name="district"
                  className={`form-control ${
                    formik.touched.district && formik.errors.district
                      ? "is-invalid"
                      : ""
                  }`}
                  {...formik.getFieldProps("district")}
                />
                {formik.touched.district && formik.errors.district ? (
                  <div className="invalid-feedback">{formik.errors.district}</div>
                ) : null}
              </div>

              <div className="mb-3">
                <label htmlFor="state" className="form-label">
                  State
                </label>
                <input
                  type="text"
                  id="state"
                  name="state"
                  className={`form-control ${
                    formik.touched.state && formik.errors.state ? "is-invalid" : ""
                  }`}
                  {...formik.getFieldProps("state")}
                />
                {formik.touched.state && formik.errors.state ? (
                  <div className="invalid-feedback">{formik.errors.state}</div>
                ) : null}
              </div>

              <div className="mb-3">
                <label htmlFor="password" className="form-label">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  className={`form-control ${
                    formik.touched.password && formik.errors.password
                      ? "is-invalid"
                      : ""
                  }`}
                  {...formik.getFieldProps("password")}
                />
                {formik.touched.password && formik.errors.password ? (
                  <div className="invalid-feedback">{formik.errors.password}</div>
                ) : null}
              </div>
              <div className="mb-3">
                <label htmlFor="confirmPassword" className="form-label">
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  className={`form-control ${
                    formik.touched.confirmPassword && formik.errors.confirmPassword
                      ? "is-invalid"
                      : ""
                  }`}
                  {...formik.getFieldProps("confirmPassword")}
                />
                {formik.touched.confirmPassword && formik.errors.confirmPassword ? (
                  <div className="invalid-feedback">
                    {formik.errors.confirmPassword}
                  </div>
                ) : null}
              </div>
              <button type="submit" className="btn btn-primary">
                Submit
              </button>
            </form>
          </div>
        </div>
      </div>
  );
};

export default AddEmployee;
