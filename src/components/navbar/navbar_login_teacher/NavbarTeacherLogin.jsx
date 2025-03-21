import React, { useState, useEffect } from 'react';
import { FaUserGraduate, FaSignOutAlt, FaBook } from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';
import "./NavbarStyle.css";
import { Navbar, Nav, NavDropdown, Container } from 'react-bootstrap';
import { Navigate } from 'react-router-dom'; // Example for React Router
import axios from 'axios';

const navbarStyle = {
  backgroundColor: '#6C4970',
};

const linkStyle = {
  color: 'white',
};

export default function NavbarTeacherLogin() {
  const [fullName, setFullName] = useState('');
  const [loggedIn, setLoggedIn] = useState(true); // Initialize loggedIn state as true
  const [role, setRole] = useState('');

  useEffect(() => {
    // Retrieve session data from localStorage
    const teacherSession = localStorage.getItem('@teacher');
    
    // Check if session data exists
    if (teacherSession) {
      const { role, firstName, lastName } = JSON.parse(teacherSession);
      setRole(role);
      setFullName(`${role} ${firstName} ${lastName}`);
      setLoggedIn(true); // Set loggedIn state to true if session exists
    } else {
      setLoggedIn(false); // Set loggedIn state to false if session does not exist
    }
  }, []);

  // Redirect to login page if user is not logged in
  if (!loggedIn) {
    return <Navigate to="/teacher_login" replace={true} />;
  }

  // Function to handle logout
  const handleLogout = () => {
    // Send POST request to server to logout
    axios.post('https://club-registration-backend-production.up.railway.app/logout')
      .then(response => {
        if (response.status === 200) {
          // Clear session data from localStorage
          localStorage.clear();
          // Redirect to login page
          window.location.href = '/';
        } else {
          // Handle error
          console.error('Logout failed');
        }
      })
      .catch(error => {
        console.error('Error:', error);
      });
  };

  return (
    <Navbar expand="lg" style={navbarStyle} className="justify-content-between">
      <Container>
      {role === 'ADMIN' && (
        <Navbar.Brand href="/admin-dashboard" style={linkStyle}>โรงเรียนของเทพวิทยา</Navbar.Brand>              
        )}
        {role === 'TEACHER' && (
        <Navbar.Brand href="/teacher-dashboard" style={linkStyle}>โรงเรียนของเทพวิทยา</Navbar.Brand>              
        )}
        
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <NavDropdown title={fullName} id="basic-nav-dropdown">
              <>
              {role !== 'TEACHER' && (
                <NavDropdown.Item href="/admin-dashboard/myclub-management"><FaBook className="mr-1" />ชุมนุมของฉัน</NavDropdown.Item>
              )}
               {role !== 'TEACHER' && (
              <NavDropdown.Divider />
              )}
              <NavDropdown.Item onClick={handleLogout}><FaSignOutAlt className="mr-1" />ออกจากระบบ</NavDropdown.Item>
              </>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
