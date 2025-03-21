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

export default function NavbarStudentLogin() {
  const [fullName, setFullName] = useState('');
  const [loggedIn, setLoggedIn] = useState(true); // Initialize loggedIn state as true

  useEffect(() => {
    // Retrieve session data from localStorage
    const studentSession = localStorage.getItem('@student');
    
    // Check if session data exists
    if (studentSession) {
      const { firstName, lastName } = JSON.parse(studentSession);
      console.log('Session data:', firstName, lastName); // Log session data
      setFullName(`สวัสดี ${firstName} ${lastName}`);
      setLoggedIn(true); 
    } else {
      console.log('No session data found');
      setLoggedIn(false);
    }
  }, []);
  

  // Redirect to login page if user is not logged in
  if (!loggedIn) {
    return <Navigate to="/student_login" replace={true} />;
  }

  // Function to handle logout
  const handleLogout = () => {
    // Send POST request to server to logout
    axios.post('https://club-registration-backend-production.up.railway.app/logout-student')
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
     
        <Navbar.Brand href="/student-page" style={linkStyle}>โรงเรียนของเทพวิทยา</Navbar.Brand>              
        
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <NavDropdown title={fullName} id="basic-nav-dropdown">
              <>
              <NavDropdown.Item onClick={handleLogout}><FaSignOutAlt className="mr-1" />ออกจากระบบ</NavDropdown.Item>
              </>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
