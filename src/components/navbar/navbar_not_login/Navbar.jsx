import React, { useState } from 'react';
import { FaHome, FaBell, FaUser, FaBullhorn, FaBook, FaDoorClosed, FaUserGraduate, FaChalkboard, FaChalkboardTeacher } from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';
import "./NavbarStyle.css";
import { Navbar, Nav, NavDropdown, Container } from 'react-bootstrap';

const navbarStyle = {
  backgroundColor: '#6C4970',
};

const linkStyle = {
  color: 'white',
};

export default function NavbarComponent() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <Navbar expand="lg" style={navbarStyle} className="justify-content-between">
      <Container>
        <Navbar.Brand href="/" style={linkStyle}>โรงเรียนของเทพวิทยา</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">  
            <NavDropdown title="เข้าสู่ระบบ" id="basic-nav-dropdown">
    
                <>
                  <NavDropdown.Item href="/student_login"><FaUserGraduate className="mr-1" />นักเรียน</NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item href="/teacher_login"><FaChalkboardTeacher className="mr-1" />ครู</NavDropdown.Item>
                </>
    
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
