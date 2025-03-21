import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom'; // Import Navigate for redirection

import NavbarTeacherLogin from '../../components/navbar/navbar_login_teacher/NavbarTeacherLogin';
import MyClub from '../../components/management/my_club/MyClub';

export default function MyClubManagement() {
  const [loggedIn, setLoggedIn] = useState(true); // Initialize loggedIn state as true

  useEffect(() => {
    // ดึงข้อมูล session จาก localStorage
    const teacherSession = localStorage.getItem('@teacher');
    
    // ตรวจสอบว่ามีข้อมูล session หรือไม่
    if (teacherSession) {
      const { role } = JSON.parse(teacherSession);
      setLoggedIn(true); // Set loggedIn state to true if session exists
    
      if (role !== "ADMIN") {
        setLoggedIn(false);
      }
    } else {
      setLoggedIn(false); // Set loggedIn state to false if session does not exist
    }
  }, []);

  // Redirect to login page if user is not logged in
  if (!loggedIn) {
    return <Navigate to="/" replace={true} />;
  }
  
  // Render NavbarTeacherLogin and MyClub components if user is logged in
  return (
    <div>
      <NavbarTeacherLogin />
      <MyClub />
    </div>
  );
}
