import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import ReactDom from 'react-dom/client'
import {
  createBrowserRouter,
  RouterProvider,
}from "react-router-dom";
import TeacherLogin from './pages/teacher_login/TeacherLoginPage.jsx'
import TeacherPage from './pages/teacher_pages/TeacherPage.jsx'
import StudentLogin from './pages/student_login/StudentLoginPage.jsx'
import StudentPage from './pages/student_page/StudentPage.jsx'
import AdminPage from './pages/teacher_pages/AdminPage.jsx'
import StudentManagement from './pages/teacher_pages/StudentManagement.jsx'
import TeacherManagement from './pages/teacher_pages/TeacherManagement.jsx'
import ClubManagement from './pages/teacher_pages/ClubManagement.jsx'
import MyClubManagement from './pages/teacher_pages/MyClubManagement.jsx'

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />
  },
  {
    path: "/teacher_login",
    element: <TeacherLogin />
  },
  {
    path: "/admin-dashboard",
    element: <AdminPage />
  },
  {
    path: "/teacher-dashboard",
    element: <TeacherPage />
  },
  {
    path: "/student_login",
    element: <StudentLogin />
  },
  {
    path: "/student-page",
    element: <StudentPage />
  },
  {
    path: "/admin-dashboard/student-management",
    element: <StudentManagement />
  },
  {
    path: "/admin-dashboard/teacher-management",
    element: <TeacherManagement />
  },
  {
    path: "/admin-dashboard/club-management",
    element: <ClubManagement />
  },
  {
    path: "/admin-dashboard/myclub-management",
    element: <MyClubManagement />
  },
 
 
]);
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
