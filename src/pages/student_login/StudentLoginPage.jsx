import React, { useState } from 'react';
import { ErrorMessage, Formik, Form, Field } from "formik";
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import * as yup from 'yup';
import { Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Link } from 'react-router-dom';

export default function StudentLogin() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = async (values) => {
    try {
      const response = await axios.post('https://club-registration-backend-production.up.railway.app/student_login', {
        student_id: values.student_id,
        card_code: values.card_code
      });
      if (response.data) {
        toast.info("เข้าสู่ระบบสำเร็จ", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnFocusLoss: true,
          draggable: true,
          progress: undefined,
          theme: "dark"
        });

        localStorage.setItem('@student', JSON.stringify(response.data)); // Store user data
        setIsLoggedIn(true);
      } else {
        console.error("Unexpected response format:", response);
      }
    } catch (error) {
      toast.error("รหัสนักเรียน หรือ เลขประจำตัวประชาชนผิด !", {
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
    student_id: yup
      .number("Student id must be an integer")
      .required("Student id is required")
      .integer("Student id must be an integer"),
    card_code: yup
      .string()
      .min(1, "Card code must be 13 characters")
      .max(13, "Card code must be 13 characters")
      .required("Card code is required"),
  });

  if (isLoggedIn) {
    return <Navigate to="/student-page" replace={true} />;
  }

  return (
    <div className='my-4 mt-5'>
      <ToastContainer position='top-right' />
      <div className="container col-md-6 mx-auto shadow p-5">
        <h1 className="text-center text-2xl">เข้าสู่ระบบสำหรับนักเรียน</h1>
        <hr className="my-4" />

        <Formik
          initialValues={{
            student_id: '',
            card_code: ''
          }}
          onSubmit={handleLogin}
          validationSchema={validationLogin}
        >
          <Form className="row g-3 ">
            <div className="mx-auto">
              <label 
                htmlFor="student_id"
                className="form-label"
              >
                รหัสนักเรียน
              </label>
              <Field
                type="text"
                name="student_id"
                className="form-control mb-3"
                placeholder="517XXX"
              />

              <ErrorMessage
                component="div"
                name="student_id"
                className="invalid-feedback"
              />
            
              <label
                htmlFor="card_code"
                className="form-label"
              >
                รหัสบัตรประจำตัวประชาชน
              </label>
              <Field
                type="password"
                name="card_code"
                placeholder="รหัสบัตรประจำตัวประชาชนของคุณ"
                className="form-control"
              />

              <ErrorMessage
                component="div"
                name="card_code"
                className="invalid-feedback"
              />
            </div>

            <div className="col-12 mx-auto">
              <button
                type="submit"
                className="btn btn-primary w-100"
              >
                Login
              </button>
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
