import React, { useEffect, useState } from 'react';
import axios from 'axios'; // Import axios for HTTP requests
import { Navigate } from 'react-router-dom'; // Import Navigate for redirection
import NavbarTeacherLogin from '../../components/navbar/navbar_login_teacher/NavbarTeacherLogin';
import CardManagement from '../../components/management/card_management/CardManagement';
import 'bootstrap/dist/css/bootstrap.min.css';
import TimeOpen from '../../components/time_open/TimeOpen';

export default function AdminPage() {
  const [fullName, setFullName] = useState('');
  const [loggedIn, setLoggedIn] = useState(true); // Initialize loggedIn state as true

  useEffect(() => {
    // ดึงข้อมูล session จาก localStorage
    const teacherSession = localStorage.getItem('@teacher');

    // ตรวจสอบว่ามีข้อมูล session หรือไม่
    if (teacherSession) {
      const { firstName, lastName, role } = JSON.parse(teacherSession);
      setFullName(`${firstName} ${lastName}`);
      setLoggedIn(true); // Set loggedIn state to true if session exists

      // Redirect to login page if user's role is not TEACHER
      if (role !== "ADMIN") {
        setLoggedIn(false);
      }
    } else {
      setLoggedIn(false); // Set loggedIn state to false if session does not exist
    }
  }, []);

  // Redirect to login page if user is not logged in or if role is not TEACHER
  if (!loggedIn) {
    return <Navigate to="/teacher_login" replace={true} />;
  }

  return (
    <div>
      <NavbarTeacherLogin />
      <TimeOpen />
      <CardManagement />
    </div>
  );
}
