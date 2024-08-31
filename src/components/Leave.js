import React, { useState, useEffect } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
import Swal from "sweetalert2";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import "../css/Leave.css";
import { MdDelete, MdEditSquare } from "react-icons/md";

const Leave = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [leaveData, setLeaveData] = useState([]);
  const [userDetails, setUserDetails] = useState({});
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [leavesPerPage] = useState(7);
  const [tokenExpired, setTokenExpired] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editLeaveData, setEditLeaveData] = useState({});
  const [editError, setEditError] = useState("");
  const [leaveTypes, setLeaveTypes] = useState({});
  const [isSuperadmin, setIsSuperadmin] = useState(false);
  const [loggedInUserName, setLoggedInUserName] = useState("");

  const toggleSidebar = () => {
    setIsSidebarOpen((prevState) => !prevState);
  };

  const user = JSON.parse(localStorage.getItem("user"));
  const is_superadmin = user?.is_superadmin;

  const navigate = useNavigate();

  const handleButtonClick = () => {
    navigate("/leaveform");
  };

  useEffect(() => {
    const fetchLeaveData = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          throw new Error("No token found. Please log in.");
        }

        const config = {
          headers: {
            "auth-token": token,
          },
        };

        const user = JSON.parse(localStorage.getItem("user"));
        setIsSuperadmin(user?.is_superadmin);

        setLoggedInUserName(user?.fullname || "");

        const leaveResponse = user?.is_superadmin
          ? await axios.get("http://13.201.51.48:8000/leave/leaves/", config)
          : await axios.get("http://13.201.51.48:8000/leave/get_leave/", config);

        const sortedLeaveData = leaveResponse.data.sort(
          (a, b) => new Date(b.start_date) - new Date(a.start_date)
        );
        const formattedLeaveData = sortedLeaveData.map((leave) => ({
          ...leave,
          start_date: new Date(leave.start_date).toLocaleDateString("en-GB"),
          end_date: new Date(leave.end_date).toLocaleDateString("en-GB"),
        }));

        setLeaveData(formattedLeaveData);

        const userResponse = await axios.get(
          "http://13.201.51.48:8000/user/get_all_users/",
          config
        );
        const users = userResponse.data.users || [];

        if (Array.isArray(users)) {
          const userDetailsMap = users.reduce((acc, user) => {
            acc[user.employee_id] = user.fullname;
            return acc;
          }, {});
          setUserDetails(userDetailsMap);
        } else {
          setError("Unexpected format of user data.");
        }
      } catch (error) {
        if (error.response) {
          if (error.response.status === 401) {
            setTokenExpired(true);
            Swal.fire({
              icon: "error",
              title: "Session Expired!",
              text: "Session has expired. Please log in again.",
              confirmButtonText: "Go to Login",
              allowOutsideClick: false,
            }).then((result) => {
              if (result.isConfirmed) {
                localStorage.clear();
                navigate("/");
              }
            });
          } else {
            setError(
              `Error: ${error.response.status} - ${
                error.response.data.message || "Internal Server Error"
              }`
            );
          }
        } else if (error.request) {
          setError("No response received from the server.");
        } else {
          setError("Error setting up the request.");
        }
      }
    };

    const fetchLeaveTypes = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          throw new Error("No token found. Please log in.");
        }

        const config = {
          headers: {
            "auth-token": token,
          },
        };

        const response = await axios.get(
          "http://13.201.51.48:8000/leave/leave-types/",
          config
        );
        const leaveTypesMap = response.data.reduce((acc, type) => {
          acc[type.leavetype_id] = type.name;
          return acc;
        }, {});
        setLeaveTypes(leaveTypesMap);
      } catch (error) {
        console.error("Error fetching leave types:", error);
      }
    };

    fetchLeaveData();
    fetchLeaveTypes();
  }, [navigate, isSuperadmin]);

  const getLeaveTypeName = (leaveTypeId) => {
    return leaveTypes[leaveTypeId] || "Unknown";
  };

  const indexOfLastLeave = currentPage * leavesPerPage;
  const indexOfFirstLeave = indexOfLastLeave - leavesPerPage;
  const currentLeaves = leaveData.slice(indexOfFirstLeave, indexOfLastLeave);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const handleEditClick = (leave) => {
    setEditLeaveData({
      ...leave,
      start_date: leave.start_date.split("/").reverse().join("-"),
      end_date: leave.end_date.split("/").reverse().join("-"),
    });
    setShowEditModal(true);
  };

  const handleEditSave = async () => {
    const { leave_type, start_date, end_date, reason } = editLeaveData;
    if (!leave_type || !start_date || !end_date || !reason) {
      setEditError("Please fill all required fields.");
      return;
    }

    try {
      const token = localStorage.getItem("accessToken");
      const config = {
        headers: { "auth-token": token },
      };

      const updatedLeaveData = {
        leave_type: parseInt(leave_type, 10),
        start_date,
        end_date,
        reason,
      };

      console.log("Updating leave data:", updatedLeaveData);

      const response = await axios.put(
        `http://13.201.51.48:8000/leave/update/${editLeaveData.leave_id}/`,
        updatedLeaveData,
        config
      );

      console.log("Update response:", response.data);

      setLeaveData((prevLeaveData) =>
        prevLeaveData.map((leave) =>
          leave.leave_id === editLeaveData.leave_id
            ? {
                ...leave,
                ...updatedLeaveData,
                start_date: new Date(
                  updatedLeaveData.start_date
                ).toLocaleDateString("en-GB"),
                end_date: new Date(
                  updatedLeaveData.end_date
                ).toLocaleDateString("en-GB"),
              }
            : leave
        )
      );

      setShowEditModal(false);
      setEditError("");

      Swal.fire({
        icon: "success",
        title: "Data Changed Successfully",
        text: "The leave record has been updated.",
        confirmButtonText: "OK",
        timer: 1000, // Duration for 1 second (1000 milliseconds)
        timerProgressBar: true,
      });
    } catch (error) {
      let errorMessage = "Failed to update leave data. Please try again later.";

      if (error.response) {
        console.error("Error response:", error.response);

        if (error.response.data && error.response.data.message) {
          errorMessage = `Failed to update leave data: ${error.response.status} - ${error.response.data.message}`;
        } else {
          errorMessage = `Failed to update leave data: ${error.response.status} - ${error.response.statusText}`;
        }
      } else if (error.request) {
        errorMessage = "No response received from the server.";
      } else {
        errorMessage = "Error setting up the request.";
      }

      setEditError(errorMessage);
      console.error("Detailed error:", error.message);
    }
  };

  const handleDeleteClick = (leave_id) => {
    Swal.fire({
      title: "Are you sure?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const token = localStorage.getItem("accessToken");
          const config = {
            headers: { "auth-token": token },
          };

          await axios.delete(
            `http://13.201.51.48:8000/leave/delete/${leave_id}/`,
            config
          );

          setLeaveData((prevLeaveData) =>
            prevLeaveData.filter((leave) => leave.leave_id !== leave_id)
          );

          Swal.fire(
            "Deleted!",
            "The leave record has been deleted.",
            "success"
          );
        } catch (error) {
          console.error("Failed to delete leave:", error);
          Swal.fire(
            "Error",
            "Failed to delete leave. Please try again later.",
            "error"
          );
        }
      }
    });
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
        <h3>Leave Records</h3>
        <button className="btn btn-primary mb-3" onClick={handleButtonClick}>
          Take a Leave
        </button>
        <div className="table">
          <table className="table table-striped table-bordered">
            <thead className="table-primary">
              <tr>
                <th>S.No</th>
                <th>Employee Name</th>
                <th>Leave Type</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Reason</th>
                {isSuperadmin && <th>Action</th>}
              </tr>
            </thead>
            <tbody>
              {currentLeaves.length > 0 ? (
                currentLeaves.map((leave, index) => (
                  <tr key={leave.leave_id}>
                    <td>{index + 1}</td>
                    <td>
                      {leave.employee_id === userDetails.employee_id
                        ? loggedInUserName
                        : userDetails[leave.employee_id] || "Me"}
                    </td>
                    <td>{getLeaveTypeName(leave.leave_type)}</td>
                    <td>{leave.start_date}</td>
                    <td>{leave.end_date}</td>
                    <td>{leave.reason}</td>
                    {isSuperadmin && (
                    <td className="text-center">
                      <i
                        class="bi bi-edit text-warning"
                        style={{ fontSize: "25px" }}
                        onClick={() => handleEditClick(leave)}
                      >
                        <MdEditSquare />
                      </i>

                      <i
                        class="bi bi-delete text-danger"
                        style={{ fontSize: "25px" }}
                        onClick={() => handleDeleteClick(leave.leave_id)}
                      >
                        <MdDelete />
                      </i>
                    </td>

                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center">
                    No data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <div className="d-flex mt-4 mb-5">
            <Stack spacing={2}>
              <Pagination
                count={Math.ceil(leaveData.length / leavesPerPage)}
                page={currentPage}
                onChange={handlePageChange}
                color="primary"
              />
            </Stack>
          </div>
        </div>
        <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Edit Leave</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group controlId="formLeaveType">
                <Form.Label>Leave Type</Form.Label>
                <Form.Control
                  as="select"
                  value={editLeaveData.leave_type}
                  onChange={(e) =>
                    setEditLeaveData({
                      ...editLeaveData,
                      leave_type: e.target.value,
                    })
                  }
                >
                  <option value="">Select Leave Type</option>
                  {Object.entries(leaveTypes).map(([id, name]) => (
                    <option key={id} value={id}>
                      {name}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>
              <Form.Group controlId="formStartDate">
                <Form.Label>Start Date</Form.Label>
                <Form.Control
                  type="date"
                  value={editLeaveData.start_date}
                  onChange={(e) =>
                    setEditLeaveData({
                      ...editLeaveData,
                      start_date: e.target.value,
                    })
                  }
                />
              </Form.Group>
              <Form.Group controlId="formEndDate">
                <Form.Label>End Date</Form.Label>
                <Form.Control
                  type="date"
                  value={editLeaveData.end_date}
                  onChange={(e) =>
                    setEditLeaveData({
                      ...editLeaveData,
                      end_date: e.target.value,
                    })
                  }
                />
              </Form.Group>
              <Form.Group controlId="formReason">
                <Form.Label>Reason</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={editLeaveData.reason}
                  onChange={(e) =>
                    setEditLeaveData({
                      ...editLeaveData,
                      reason: e.target.value,
                    })
                  }
                />
              </Form.Group>
            </Form>
            {editError && <div className="error-message">{editError}</div>}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="primary" className="w-50" onClick={handleEditSave}>
              Save Changes
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
};

export default Leave;
