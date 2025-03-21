import React, { useState } from 'react';
import { ErrorMessage, Formik, Form, Field } from "formik";
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import * as yup from 'yup';
import { Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Link } from 'react-router-dom';
export default function TeacherLogin() {
  const [role, setRole] = useState(null);
  const handleLogin = async (values) => {
    try {
      const response = await axios.post('https://club-registration-backend-production.up.railway.app/teacher_login', {
        email: values.email,
        password: values.password
      });
      
      if (response.data && response.data.role) {
        toast.info(response.data.msg, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnFocusLoss: true,
          draggable: true,
          progress: undefined,
          theme: "dark"
        });

        localStorage.setItem('@teacher', JSON.stringify(response.data));
        setRole(response.data.role); // Assuming the response contains a role field
      } else {
        console.log("Unexpected response format:", response);
      }
    } catch (error) {
      console.error("Error during login:", error);
      toast.error("อีเมล หรือ รหัสผ่านผิดพลาด !", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark"
      });
    }
  };

  const validationLogin = yup.object().shape({
    email: yup
      .string()
      .email("Email invalid"),
    password: yup
      .string()
      .min(3, "Password must be at least 6 characters long")
      .required("Password is required"),
  });

  if (role === 'TEACHER') {
    return <Navigate to="/teacher-dashboard" replace={true} />;
  } else if (role === 'ADMIN') {
    return <Navigate to="/admin-dashboard" replace={true} />;
  }

  return (
    <div className='my-4 mt-5 '>
      <ToastContainer position='top-right' />
      <div className="container col-md-6 mx-auto shadow p-5">
        <h1 className="text-center text-2xl">เข้าสู่ระบบสำหรับครู</h1>
        <hr className="my-4" />

        <Formik
          initialValues={{
            email: '',
            password: ''
          }}
          onSubmit={handleLogin}
          validationSchema={validationLogin}
        >
          <Form className="row g-3 ">
            <div className="mx-auto">
              <label htmlFor="email" className="form-label">กรอกอีเมลของคุณ</label>
              <Field type="email" name="email" className="form-control mb-3" placeholder="name@club.com" />
              <ErrorMessage component="div" name="email" className="invalid-feedback" />
              
              <label htmlFor="password" className="form-label">กรอกรหัสผ่านของคุณ</label>
              <Field type="password" name="password" placeholder="รหัสผ่าน..." className="form-control" />
              <ErrorMessage component="div" name="password" className="invalid-feedback" />

              <div className="col-md-12 mx-auto my-3">
              <button type="submit" className="btn btn-primary w-100">เข้าสู่ระบบ</button></div>
            
            </div>
            <div className="text-center mt-3">
        <Link to="/" className="text-decoration-none btn btn-danger">ย้อนกลับไปหน้าแรก</Link>
      </div>
       
          </Form>
          
        </Formik>
        
      </div>
    </div>
  );
}
