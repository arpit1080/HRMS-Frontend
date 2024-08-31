import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
import { Modal, Form, Button } from "react-bootstrap";
import "../css/Employee.css";
import { format, parseISO, isValid } from "date-fns";
import { FiEdit } from "react-icons/fi";
import { MdDelete,MdEditSquare } from "react-icons/md";
import { PiToggleLeftFill,PiToggleRightFill } from "react-icons/pi";


const Employee = () => {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(7);
  const [tokenExpired, setTokenExpired] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editEmployee, setEditEmployee] = useState({});
  const [editError, setEditError] = useState("");

  const toggleSidebar = () => {
    setIsSidebarOpen((prevState) => !prevState);
  };

  const user = JSON.parse(localStorage.getItem("user"));
  const is_superadmin = user?.is_superadmin;

  const navigate = useNavigate();

  const handleAddEmployee = () => {
    navigate("/addemployee");
  };

  const handleSoftDelete = async (employee_id) => {
    try {
      await axios.delete(
        `http://13.201.51.48:8000/user/soft_delete_user/${employee_id}`,
        {
          headers: {
            "auth-token": localStorage.getItem("accessToken"),
          },
        }
      );
      setEmployees((prevEmployees) =>
        prevEmployees.map((employee) =>
          employee.employee_id === employee_id
            ? { ...employee, is_active: false }
            : employee
        )
      );
      // Swal.fire("Success", "Employee soft deleted successfully.", "success");
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "Error inactivating employee",
        confirmButtonText: "OK",
      });
    }
  };

  const handleRestore = async (employee_id) => {
    try {
      await axios.put(
        `http://13.201.51.48:8000/user/restore/${employee_id}`,
        {},
        {
          headers: {
            "auth-token": localStorage.getItem("accessToken"),
          },
        }
      );
      setEmployees((prevEmployees) =>
        prevEmployees.map((employee) =>
          employee.employee_id === employee_id
            ? { ...employee, is_active: true }
            : employee
        )
      );
      // Swal.fire("Success", "Employee restored successfully.", "success");
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "Error activating employee",
        confirmButtonText: "OK",
      });
    }
  };

  const handleEditClick = (employee) => {
    setEditEmployee({
      ...employee,
      birthdate: employee.birthdate.split("/").reverse().join("-"),
    });
    setShowEditModal(true);
  };

  const handleEditSave = async () => {
    const {
      work_type,
      fullname,
      email_id,
      mobile_number,
      birthdate,
      address,
      state,
      district,
    } = editEmployee;
    if (
      !work_type ||
      !fullname ||
      !email_id ||
      !mobile_number ||
      !birthdate ||
      !address ||
      !state ||
      !district
    ) {
      setEditError("Please fill all required fields.");
      return;
    }

    try {
      const token = localStorage.getItem("accessToken");
      const config = {
        headers: { "auth-token": token },
      };

      const updatedEmployeeData = {
        work_type,
        fullname,
        email_id,
        mobile_number,
        birthdate,
        address,
        state,
        district,
      };

      const response = await axios.put(
        `http://13.201.51.48:8000/user/update_user/${editEmployee.employee_id}`,
        updatedEmployeeData,
        config
      );

      setEmployees((prevEmployees) =>
        prevEmployees.map((employee) =>
          employee.employee_id === editEmployee.employee_id
            ? {
                ...employee,
                ...updatedEmployeeData,
              }
            : employee
        )
      );

      setShowEditModal(false);
      setEditError("");

      Swal.fire({
        icon: "success",
        title: "Data Changed Successfully",
        text: "The Employee record has been updated.",
        confirmButtonText: "OK",
        timer: 1000, // Duration for 1 second (1000 milliseconds)
        timerProgressBar: true,
      });
    } catch (error) {
      let errorMessage =
        "Failed to update employee data. Please try again later.";

      if (error.response) {
        errorMessage = `Failed to update employee data: ${error.response.status} - ${error.response.data.message}`;
      } else if (error.request) {
        errorMessage = "No response received from the server.";
      } else {
        errorMessage = "Error setting up the request.";
      }

      setEditError(errorMessage);
    }
  };

  const handleHardDelete = async (employee_id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(
          `http://13.201.51.48:8000/user/hard_delete_user/${employee_id}`,
          {
            headers: {
              "auth-token": localStorage.getItem("accessToken"),
            },
          }
        );
        setEmployees((prevEmployees) =>
          prevEmployees.filter(
            (employee) => employee.employee_id !== employee_id
          )
        );
        Swal.fire({
          icon: "success",
          title: "Employee has been deleted.",
          timer: 1500,
          timerProgressBar: true,
        });
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.response?.data?.message || "Error deleting employee",
          confirmButtonText: "OK",
        });
      }
    }
  };

  const fetchEmployees = useCallback(async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        navigate("/");
        return;
      }

      const config = {
        headers: {
          "auth-token": token,
        },
      };

      const response = await axios.get(
        "http://13.201.51.48:8000/user/get_all_users/",
        { params: { search: searchQuery, status: statusFilter }, ...config }
      );
      if (response.data && Array.isArray(response.data.users)) {
        const sortedEmployees = response.data.users.sort(
          (a, b) => b.employee_id - a.employee_id
        );
        setEmployees(sortedEmployees);
      } else {
        throw new Error("Unexpected response format");
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        setTokenExpired(true);
        Swal.fire({
          icon: "error",
          title: "Session Expired",
          text: "Your session has expired. Please log in again.",
          confirmButtonText: "Go to Login",
        }).then((result) => {
          if (result.isConfirmed) {
            localStorage.clear();
            navigate("/");
          }
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text:
            error.response?.data?.message ||
            error.message ||
            "Error fetching employees",
          confirmButtonText: "OK",
        });
      }
    }
  }, [searchQuery, statusFilter, navigate]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  useEffect(() => {
    let filtered = [...employees];
    if (searchQuery) {
      filtered = filtered.filter(
        (employee) =>
          employee.email_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          employee.employee_id.toString().includes(searchQuery) ||
          employee.fullname.toLowerCase().includes(searchQuery.toLowerCase()) ||
          employee.mobile_number.includes(searchQuery) ||
          employee.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
          employee.state.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (statusFilter !== "all") {
      const isActive = statusFilter === "active";
      filtered = filtered.filter((employee) => employee.is_active === isActive);
    }
    setFilteredEmployees(filtered);
  }, [employees, searchQuery, statusFilter]);

  // Pagination logic
  const indexOfLastEmployee = currentPage * itemsPerPage;
  const indexOfFirstEmployee = indexOfLastEmployee - itemsPerPage;
  const currentEmployees = filteredEmployees.slice(
    indexOfFirstEmployee,
    indexOfLastEmployee
  );
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const handleEditChange = (event) => {
    const { name, value } = event.target;
    setEditEmployee((prevEmployee) => ({
      ...prevEmployee,
      [name]: value,
    }));
  };

  if (tokenExpired) {
    return null;
  }
  return (
    <div className="container pt-2">
      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        isSuperadmin={user.is_superadmin}
      />
      <div
        className={`content ${
          isSidebarOpen ? "content-expanded" : "content-collapsed"
        }`}
      >
        <Navbar toggleSidebar={toggleSidebar} />
        <h3>Employee Records</h3>
        {is_superadmin && (
          <button
            className="btn btn-primary mb-1 me-2"
            onClick={handleAddEmployee}
          >
            Add Employee
          </button>
        )}
        <div className="filters mt-2 align-items-center">
          <input
            type="text"
            className="form-control mt-1 mb-2"
            style={{ width: "500px" }}
            placeholder="Search by name, email, mobile number, district, or state"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {is_superadmin && (
            <select
              className="form-control mt-1"
              style={{ width: "500px" }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          )}
        </div>
        <table className="table table-striped table-bordered">
          <thead className="table-primary">

            <tr>
              <th>No</th>
              <th>EmployeeId</th>
              <th>Name</th>
              <th>Type</th>
              <th>Email</th>
              <th>ContactNumber</th>
              <th>Birthdate</th>
              <th>Address</th>
              <th>District</th>
              <th>State</th>
              {is_superadmin && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {currentEmployees.length === 0 ? (
              <tr>
                <td colSpan={is_superadmin ? 11 : 9} className="text-center">
                  No data found
                </td>
              </tr>
            ) : (
              currentEmployees.map((employee, index) => (
                <tr key={employee.employee_id} className="text-left">
                  <td>{indexOfFirstEmployee + index + 1}</td>
                  <td>{employee.employee_id}</td>
                  <td>{employee.fullname}</td>
                  <td>{employee.work_type}</td>
                  <td>{employee.email_id}</td>
                  <td>{employee.mobile_number}</td>
                  <td>
                    {isValid(parseISO(employee.birthdate))
                      ? format(parseISO(employee.birthdate), "dd/MM/yyyy")
                      : "Invalid date"}
                  </td>
                  <td>{employee.address}</td>
                  <td>{employee.district}</td>
                  <td>{employee.state}</td>
                  {is_superadmin && (
                    <td className="text-center">
                        {employee.is_active ? (
                          <>
                              <i className="bi bi-toggle-on text-success" style={{fontSize:"30px"}}onClick={() => handleSoftDelete(employee.employee_id)}><PiToggleRightFill />
                              </i>
                            
                              <i className="bi bi-edit text-warning" style={{fontSize:"25px"}}onClick={() => handleEditClick(employee)}>
                                <MdEditSquare />
                              </i>

                              <i className="bi bi-delete text-danger" style={{fontSize:"25px"}}onClick={() =>
                                  handleHardDelete(employee.employee_id)
                                }><MdDelete />
                              </i>                              
                              </>
                        ) : (
                          <i className="bi bi-toggle-off text-danger" style={{fontSize:"30px"}}onClick={() => handleRestore(employee.employee_id)}><PiToggleLeftFill />
                          </i>
                        )}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
        <div className="d-flex mt-4 mb-5">
          <Stack spacing={2}>
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={handlePageChange}
              color="primary"
            />
          </Stack>
        </div>
      </div>
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Employee</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
          <Form.Group controlId="formWorkType">
              <Form.Label>Type</Form.Label>
              <Form.Control
                as="select"
                value={editEmployee.work_type}
                onChange={(e) => setEditEmployee({ ...editEmployee, work_type: e.target.value })}
              >
                <option value="">Select Work Type</option>
                  <option value="OFFICE">OFFICE</option>
                  <option value="FIELD">FIELD</option>
                  <option value="BOTH">BOTH</option>
              </Form.Control>
            </Form.Group>

            <Form.Group controlId="fullname">
              <Form.Label>Full Name</Form.Label>
              <Form.Control
                type="text"
                name="fullname"
                value={editEmployee.fullname || ""}
                onChange={handleEditChange}
              />
            </Form.Group>

            <Form.Group controlId="email_id">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email_id"
                value={editEmployee.email_id || ""}
                onChange={handleEditChange}
              />
            </Form.Group>

            <Form.Group controlId="mobile_number">
              <Form.Label>ContactNumber</Form.Label>
              <Form.Control
                type="text"
                name="mobile_number"
                value={editEmployee.mobile_number || ""}
                onChange={handleEditChange}
              />
            </Form.Group>

            <Form.Group controlId="birthdate">
              <Form.Label>Birthdate</Form.Label>
              <Form.Control
                type="date"
                name="birthdate"
                value={editEmployee.birthdate || ""}
                onChange={handleEditChange}
              />
            </Form.Group>

            <Form.Group controlId="address">
              <Form.Label>Address</Form.Label>
              <Form.Control
                type="text"
                name="address"
                value={editEmployee.address || ""}
                onChange={handleEditChange}
              />
            </Form.Group>

            <Form.Group controlId="state">
              <Form.Label>State</Form.Label>
              <Form.Control
                type="text"
                name="state"
                value={editEmployee.state || ""}
                onChange={handleEditChange}
              />
            </Form.Group>

            <Form.Group controlId="district">
              <Form.Label>District</Form.Label>
              <Form.Control
                type="text"
                name="district"
                value={editEmployee.district || ""}
                onChange={handleEditChange}
              />
            </Form.Group>
            {editError && <div className="text-danger mt-3">{editError}</div>}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" className="w-50" onClick={handleEditSave}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Employee;
