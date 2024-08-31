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
import "../css/PublicHoliday.css";
import { MdDelete, MdEditSquare } from "react-icons/md";

const PublicHoliday = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [publicHolidayData, setPublicHolidayData] = useState([]);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [holidaysPerPage] = useState(10);
  const [tokenExpired, setTokenExpired] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editHoliday, setEditHoliday] = useState({});

  const toggleSidebar = () => {
    setIsSidebarOpen((prevState) => !prevState);
  };

  const navigate = useNavigate();

  const handleNavigate = () => {
    navigate("/addpublicholiday");
  };

  const handleEdit = (holiday) => {
    let formattedDate = "";
    if (holiday.date) {
      const date = new Date(holiday.date);
      if (!isNaN(date.getTime())) {
        formattedDate = date.toISOString().split("T")[0]; // Format date for input field
      }
    }

    setEditHoliday({
      ...holiday,
      date: formattedDate, // Set the formatted date or an empty string if invalid
    });
    setShowEditModal(true);
  };

  const handleDelete = async (holiday_id) => {
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
          `http://13.201.51.48:8000/publicholiday/delete_public_holidays/${holiday_id}/`,
          {
            headers: {
              "auth-token": localStorage.getItem("accessToken"),
            },
          }
        );
        setPublicHolidayData((prevData) =>
          prevData.filter((holiday) => holiday.holiday_id !== holiday_id)
        );
        Swal.fire("Deleted!", "Data has been deleted.", "success");
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.response?.data?.message || "Error deleting Data",
          confirmButtonText: "OK",
        });
      }
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("No token found. Please log in.");

      const config = {
        headers: {
          "auth-token": token,
        },
      };

      // Format the date to dd/mm/yyyy before sending it to the server
      const formattedHoliday = {
        ...editHoliday,
        date: new Date(editHoliday.date)
          .toLocaleDateString("en-GB")
          .split("/")
          .reverse()
          .join("-"),
      };

      await axios.put(
        `http://13.201.51.48:8000/publicholiday/update_public_holidays/${editHoliday.holiday_id}/`,
        formattedHoliday,
        config
      );

      // Fetch the updated list of holidays after successful update
      const response = await axios.get(
        "http://13.201.51.48:8000/publicholiday/public_holidays/",
        config
      );

      // Format the dates and sort in ascending order
      const sortedHolidayData = response.data.sort(
        (a, b) => new Date(a.date) - new Date(b.date)
      );
      const formattedHolidayData = sortedHolidayData.map((holiday) => ({
        ...holiday,
        date: new Date(holiday.date).toLocaleDateString("en-GB"),
      }));

      setPublicHolidayData(formattedHolidayData); // Update the state with the latest data

      setShowEditModal(false);
      Swal.fire("Success!", "Holiday updated successfully.", "success");
    } catch (error) {
      Swal.fire(
        "Error!",
        "Something went wrong. Please try again later.",
        "error"
      );
    }
  };

  useEffect(() => {
    const fetchPublicHolidayData = async () => {
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

        // Fetch public holiday data
        const response = await axios.get(
          "http://13.201.51.48:8000/publicholiday/public_holidays/",
          config
        );

        // Format the dates and sort in ascending order
        const sortedHolidayData = response.data.sort(
          (a, b) => new Date(a.date) - new Date(b.date)
        );
        const formattedHolidayData = sortedHolidayData.map((holiday) => ({
          ...holiday,
          date: new Date(holiday.date).toLocaleDateString("en-GB"),
        }));

        setPublicHolidayData(formattedHolidayData);
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

    fetchPublicHolidayData();
  }, [navigate]);

  const indexOfLastHoliday = currentPage * holidaysPerPage;
  const indexOfFirstHoliday = indexOfLastHoliday - holidaysPerPage;
  const currentHolidays = publicHolidayData.slice(
    indexOfFirstHoliday,
    indexOfLastHoliday
  );

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const user = JSON.parse(localStorage.getItem("user"));
  const is_superadmin = user?.is_superadmin;

  if (tokenExpired) {
    return null;
  }

  return (
    <div className="container pt-2">
      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        isSuperadmin={is_superadmin}
      />
      <div
        className={`content ${
          isSidebarOpen ? "content-expanded" : "content-collapsed"
        }`}
      >
        <Navbar toggleSidebar={toggleSidebar} />
        <h3>Public Holidays</h3>
        <button onClick={handleNavigate} className="btn btn-primary mb-3">
          Add Holidays
        </button>
        <div className="table-container">
          {!error ? (
            <>
              <PublicHolidayTable
                publicHolidayData={currentHolidays}
                currentPage={currentPage}
                holidaysPerPage={holidaysPerPage}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
              <div className="d-flex mt-4 mb-5">
                <Stack spacing={2}>
                  <Pagination
                    count={Math.ceil(
                      publicHolidayData.length / holidaysPerPage
                    )}
                    color="primary"
                    page={currentPage}
                    onChange={handlePageChange}
                  />
                </Stack>
              </div>
            </>
          ) : (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}
        </div>

        <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Edit Public Holiday</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleEditSubmit}>
              <Form.Group className="mb-3" controlId="holidayName">
                <Form.Label>Name</Form.Label>
                <Form.Control
                  type="text"
                  value={editHoliday.name || ""}
                  onChange={(e) =>
                    setEditHoliday({ ...editHoliday, name: e.target.value })
                  }
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="holidayDate">
                <Form.Label>Date</Form.Label>
                <Form.Control
                  type="date"
                  value={editHoliday.date}
                  onChange={(e) =>
                    setEditHoliday({ ...editHoliday, date: e.target.value })
                  }
                  required
                />
              </Form.Group>
              <Button variant="primary" className="w-50" type="submit">
                Save Changes
              </Button>
            </Form>
          </Modal.Body>
        </Modal>
      </div>
    </div>
  );
};

const PublicHolidayTable = ({ publicHolidayData, onEdit, onDelete }) => {
  return (
    <div className="table-responsive">
      <table className="table table-bordered table-striped">
        <thead className="table-primary">
          <tr>
            <th>Sr. No</th>
            <th>Holiday Name</th>
            <th>Holiday Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {publicHolidayData.map((holiday, index) => (
            <tr key={holiday.holiday_id}>
              <td>{index + 1}</td>
              <td>{holiday.name}</td>
              <td>{holiday.date}</td>
              <td className="text-center">
                <i
                  class="bi bi-edit text-warning"
                  style={{ fontSize: "25px" }}
                  onClick={() => onEdit(holiday)}
                >
                  <MdEditSquare />
                </i>

                <i
                  class="bi bi-delete text-danger"
                  style={{ fontSize: "25px" }}
                  onClick={() => onDelete(holiday.holiday_id)}
                >
                  <MdDelete />
                </i>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PublicHoliday;
