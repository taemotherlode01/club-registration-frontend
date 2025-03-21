import React from 'react'
import CardCountStudentClass from '../../components/management/table_count_student_class/TableCountStudentClass'
import NavbarTeacherLogin from '../../components/navbar/navbar_login_teacher/NavbarTeacherLogin'
import AllStudents from '../../components/management/table_all_student/AllStudents'
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom'; // Import Navigate for redirection
export default function StudentManagement() {
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
  return (
    <div>
        <NavbarTeacherLogin />
        <CardCountStudentClass />
        <AllStudents />
    </div>
  )
}
