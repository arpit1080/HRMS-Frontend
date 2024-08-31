import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import axios from "axios";
import Swal from "sweetalert2";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
import { format, parseISO, toZonedTime, fromZonedTime } from "date-fns-tz";
import "../css/Attendance.css";
import { MdDelete,MdEditSquare } from "react-icons/md";


// Helper function to format date to DD/MM/YYYY
const formatDate = (dateString) => {
  if (!dateString) return "N/A";

  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
};

// Helper function to determine attendance status
const getStatus = (checkInTime) => {
  if (!checkInTime) return "Absent";

  const checkInDate = new Date(checkInTime);
  const threshold1 = new Date(checkInDate);
  threshold1.setHours(10, 15, 0, 0); // 10:15 AM

  const threshold2 = new Date(checkInDate);
  threshold2.setHours(16, 0, 0, 0); // 4:00 PM

  if (checkInDate <= threshold1) return "Present On Time";
  if (checkInDate <= threshold2) return "Late Present";
  return "Absent";
};

const Attendance = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [attendanceData, setAttendanceData] = useState([]);
  const [userDetails, setUserDetails] = useState({});
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [attendancePerPage] = useState(10);
  const [tokenExpired, setTokenExpired] = useState(false);
  const [isSuperadmin, setIsSuperadmin] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editAttendance, setEditAttendance] = useState({});
  const [editError, setEditError] = useState("");
  const [loggedInUserName, setLoggedInUserName] = useState("");

  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));
  const is_superadmin = user?.is_superadmin;

  const toggleSidebar = () => {
    setIsSidebarOpen((prevState) => !prevState);
  };

  const handleNavigate = () => {
    navigate("/addattendance");
  };

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setError("No token found. Please log in.");
        return;
      }

      const config = {
        headers: {
          "auth-token": token,
        },
      };

      const user = JSON.parse(localStorage.getItem("user"));
      setIsSuperadmin(user?.is_superadmin);

      // Store the logged-in user's name
      setLoggedInUserName(user?.fullname || "");

      // Fetch attendance data based on user role
      const attendanceResponse = user?.is_superadmin
        ? await axios.get(
            "http://13.201.51.48:8000/attendance/get_all_attendance/",
            config
          )
        : await axios.get(
            "http://13.201.51.48:8000/attendance/get_attendance/",
            config
          );

      const data = attendanceResponse.data.data || [];

      // Sort data by date in descending order (latest first)
      data.sort((a, b) => new Date(b.date) - new Date(a.date));
      setAttendanceData(data);

      // Fetch all user details
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
        throw new Error("Unexpected format of user data.");
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
              localStorage.clear(); // Clear local storage
              navigate("/"); // Redirect to login page
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

  useEffect(() => {
    fetchData();
  }, [navigate]);

  const indexOfLastAttendance = currentPage * attendancePerPage;
  const indexOfFirstAttendance = indexOfLastAttendance - attendancePerPage;
  const currentAttendanceData = attendanceData.slice(
    indexOfFirstAttendance,
    indexOfLastAttendance
  );

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const handleEditClick = (attendance) => {
    setEditAttendance({
      ...attendance,
      date: formatDate(attendance.date),
      check_in_time: attendance.check_in_time
        ? format(
            toZonedTime(new Date(attendance.check_in_time), "Asia/Kolkata"),
            "HH:mm"
          )
        : "",
      check_out_time: attendance.check_out_time
        ? format(
            toZonedTime(new Date(attendance.check_out_time), "Asia/Kolkata"),
            "HH:mm"
          )
        : "",
    });
    setShowEditModal(true);
  };

  const handleDeleteClick = (attendance_id) => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      Swal.fire({
        icon: "error",
        title: "Unauthorized",
        text: "No token found. Please log in.",
        confirmButtonText: "Go to Login",
      }).then((result) => {
        if (result.isConfirmed) {
          localStorage.clear(); // Clear local storage
          navigate("/"); // Redirect to login page
        }
      });
      return;
    }

    Swal.fire({
      title: "Are you sure?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .delete(
            `http://13.201.51.48:8000/attendance/delete_attendance/${attendance_id}/`,
            {
              headers: { "auth-token": token },
            }
          )
          .then(() => {
            Swal.fire({
              position: "center",
              icon: "success",
              title: "Data Deleted successfully!",
              showConfirmButton: false,
              timer: 1500,
            });
            fetchData(); // Refresh data
          })
          .catch((err) => {
            if (err.response) {
              console.error("Error response:", err.response);
              if (err.response.status === 401) {
                Swal.fire({
                  icon: "error",
                  title: "Session Expired",
                  text: "Your session has expired. Please log in again.",
                  confirmButtonText: "Go to Login",
                }).then((result) => {
                  if (result.isConfirmed) {
                    localStorage.clear(); // Clear local storage
                    navigate("/"); // Redirect to login page
                  }
                });
              } else if (err.response.status === 500) {
                Swal.fire(
                  "Error!",
                  "Internal Server Error. Please try again later.",
                  "error"
                );
              } else {
                Swal.fire(
                  "Error!",
                  `There was an error deleting the record: ${err.response.data}`,
                  "error"
                );
              }
            } else {
              console.error("Error message:", err.message);
              Swal.fire(
                "Error!",
                "There was an error deleting the record.",
                "error"
              );
            }
          });
      }
    });
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    const token = localStorage.getItem("accessToken");
    if (!token) {
      Swal.fire({
        icon: "error",
        title: "Unauthorized",
        text: "No token found. Please log in.",
        confirmButtonText: "Go to Login",
      }).then((result) => {
        if (result.isConfirmed) {
          localStorage.clear(); // Clear local storage
          navigate("/"); // Redirect to login page
        }
      });
      return;
    }

    const [day, month, year] = editAttendance.date.split("/");
    const formattedDate = `${year}-${month}-${day}`;

    const checkInTime = editAttendance.check_in_time
      ? format(
          fromZonedTime(
            `${formattedDate}T${editAttendance.check_in_time}`,
            "Asia/Kolkata"
          ),
          "yyyy-MM-dd'T'HH:mm:ss"
        )
      : null;
    const checkOutTime = editAttendance.check_out_time
      ? format(
          fromZonedTime(
            `${formattedDate}T${editAttendance.check_out_time}`,
            "Asia/Kolkata"
          ),
          "yyyy-MM-dd'T'HH:mm:ss"
        )
      : null;

    axios
      .put(
        `http://13.201.51.48:8000/attendance/update_attendance_time/${editAttendance.attendance_id}/`,
        {
          check_in_time: checkInTime,
          check_out_time: checkOutTime,
        },
        {
          headers: { "auth-token": token },
        }
      )
      .then(() => {
        Swal.fire({
          position: "center",
          icon: "success",
          title: "Attendance updated successfully!",
          showConfirmButton: false,
          timer: 1500,
        });
        fetchData(); // Refresh data
        setShowEditModal(false); // Close modal
      })
      .catch((err) => {
        if (err.response) {
          console.error("Error response:", err.response);
          if (err.response.status === 401) {
            Swal.fire({
              icon: "error",
              title: "Session Expired",
              text: "Your session has expired. Please log in again.",
              confirmButtonText: "Go to Login",
            }).then((result) => {
              if (result.isConfirmed) {
                localStorage.clear(); // Clear local storage
                navigate("/"); // Redirect to login page
              }
            });
          } else if (err.response.status === 500) {
            Swal.fire(
              "Error!",
              "Internal Server Error. Please try again later.",
              "error"
            );
          } else {
            Swal.fire(
              "Error!",
              `There was an error updating the record: ${err.response.data}`,
              "error"
            );
          }
        } else {
          console.error("Error message:", err.message);
          Swal.fire(
            "Error!",
            "There was an error updating the record.",
            "error"
          );
        }
      });
  };

  if (tokenExpired) {
    return null;
  }
  return (
    <div className="container">
      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        isSuperadmin={isSuperadmin}
      />
      <div
        className={`content ${
          isSidebarOpen ? "content-expanded" : "content-collapsed"
        }`}
      >
        <Navbar toggleSidebar={toggleSidebar} />
        <h3>Attendance Records</h3>
        <button className="btn btn-primary mb-3" onClick={handleNavigate}>
          Add Attendance
        </button>

        {tokenExpired && (
          <div className="alert alert-danger" role="alert">
            Your session has expired. Please{" "}
            <a href="/" className="alert-link">
              log in again
            </a>
            .
          </div>
        )}

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        <table className="table table-striped table-bordered">
          <thead className="table-primary">
            <tr>
              <th>S.No</th>
              <th>Date</th>
              <th>Employee Name</th>
              <th>Check In</th>
              <th>Check Out</th>
              <th>Status</th> {/* New column for Status */}
              {isSuperadmin && <th>Action</th>}
            </tr>
          </thead>
          <tbody>
            {currentAttendanceData.map((attendance, index) => (
              <tr key={attendance.attendance_id}>
                <td>{indexOfFirstAttendance + index + 1}</td>
                <td>{formatDate(attendance.date)}</td>
                <td>{userDetails[attendance.employee_id] || "Me"}</td>
                <td>
                  {attendance.check_in_time
                    ? new Date(attendance.check_in_time).toLocaleTimeString()
                    : "--:--"}
                </td>
                <td>
                  {attendance.check_out_time
                    ? new Date(attendance.check_out_time).toLocaleTimeString()
                    : "--:--"}
                </td>
                <td>{getStatus(attendance.check_in_time)}</td>{" "}
                {/* Display status */}
                {isSuperadmin && (
                  <td className="text-center">
                    <i
                      class="bi bi-edit text-warning"
                      style={{ fontSize: "25px" }}
                      onClick={() => handleEditClick(attendance)}
                    >
                      <MdEditSquare />
                    </i>

                    <i
                      class="bi bi-delete text-danger"
                      style={{ fontSize: "25px" }}
                      onClick={() =>
                        handleDeleteClick(attendance.attendance_id)}
                    >
                      <MdDelete />
                    </i>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        <Stack spacing={2}>
          <Pagination
            count={Math.ceil(attendanceData.length / attendancePerPage)}
            page={currentPage}
            onChange={handlePageChange}
            color="primary"
          />
        </Stack>
      </div>

      <Modal
        show={showEditModal}
        className="custom-modal"
        onHide={() => setShowEditModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Edit Attendance</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            {editError && (
              <div className="alert alert-danger" role="alert">
                {editError}
              </div>
            )}

            <Form.Group className="mb-3" controlId="check_in_time">
              <Form.Label>check_in_time</Form.Label>
              <Form.Control
                type="time"
                value={editAttendance.check_in_time || ""}
                onChange={(e) =>
                  setEditAttendance({
                    ...editAttendance,
                    check_in_time: e.target.value,
                  })
                }
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="check_out_time">
              <Form.Label>check_out_time</Form.Label>
              <Form.Control
                type="time"
                id="check_out_time"
                value={editAttendance.check_out_time}
                onChange={(e) =>
                  setEditAttendance({
                    ...editAttendance,
                    check_out_time: e.target.value,
                  })
                }
              />
            </Form.Group>

            <Button
              variant="primary"
              className="w-50"
              onClick={handleEditSubmit}
            >
              Save Changes
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Attendance;
