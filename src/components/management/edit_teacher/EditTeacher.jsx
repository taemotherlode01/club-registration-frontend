import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Modal, Button } from 'react-bootstrap';
import Swal from 'sweetalert2';

function EditTeacher({ teacherData, onRefresh, onClose }) {
  const [formData, setFormData] = useState({
    first_name: teacherData.first_name,
    last_name: teacherData.last_name,
    phone_number: teacherData.phone_number,
    email: teacherData.email,
    password: teacherData.password,
    role_id: teacherData.role_id
  });
  const [roleList, setRoleList] = useState([]);

  useEffect(() => {
    fetchRole();
  }, []);

  const fetchRole = async () => {
    try {
      const response = await axios.get('https://club-registration-backend-production.up.railway.app/role_list');
      setRoleList(response.data);
    } catch (error) {
      console.error('Error fetching role list:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { email, password, first_name, last_name, phone_number, role_id } = formData;
      const requestData = { email, first_name, last_name, phone_number, password, role_id };
      const response = await axios.put(`https://club-registration-backend-production.up.railway.app/update_teacher/${teacherData.teacher_id}`, requestData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      Swal.fire({
        icon: 'success',
        title: 'เพิ่มข้อมูลสำเร็จ!',
        text: 'ข้อมูลครูถูกแก้ไขเรียบร้อยแล้ว',
        confirmButtonText: 'ตกลง'
      });
      if (typeof onRefresh === 'function') {
        onRefresh();
      }
      onClose(); // ปิด Modal หลังจากสำเร็จ
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด!',
        text: 'เกิดข้อผิดพลาดในการแก้ไขข้อมูลครู',
        confirmButtonText: 'ตกลง'
      });
    }
  };

  return (
    <>
      <Modal.Header closeButton>
        <Modal.Title>แก้ไขครู</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-6">
              <div className="mb-3">
                <label htmlFor="first_name" className="form-label">ชื่อ</label>
                <input type="text" className="form-control" id="first_name" name="first_name" value={formData.first_name} onChange={handleChange} />
              </div>
              <div className="mb-3">
                <label htmlFor="last_name" className="form-label">นามสกุล</label>
                <input type="text" className="form-control" id="last_name" name="last_name" value={formData.last_name} onChange={handleChange} />
              </div>
              <div className="mb-3">
                <label htmlFor="phone_number" className="form-label">เบอร์โทร</label>
                <input type="text" className="form-control" id="phone_number" name="phone_number" value={formData.phone_number} onChange={handleChange} />
              </div>
            </div>
            <div className="col-md-6">
              <div className="mb-3">
                <label htmlFor="email" className="form-label">อีเมล</label>
                <input type="email" className="form-control" id="email" name="email" value={formData.email} onChange={handleChange} />
              </div>
              <div className="mb-3">
                <label htmlFor="password" className="form-label">รหัสผ่าน</label>
                <input type="password" className="form-control" id="password" name="password" value={formData.password} onChange={handleChange} />
              </div>
              <div className="mb-3">
                <label htmlFor="role_id" className="form-label">สิทธิ</label>
                <select className="form-control" id="role_id" name="role_id" value={formData.role_id} onChange={handleChange} required>
                  <option value="">เลือกสิทธิ</option>
                  {roleList.map((roleItem) => (
                    <option key={roleItem.role_id} value={roleItem.role_id}>{roleItem.role_name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <Modal.Footer>
            <Button variant="secondary" onClick={onClose}>ยกเลิก</Button>
            <Button variant="primary" type="submit">บันทึก</Button>
          </Modal.Footer>
        </form>
      </Modal.Body>
    </>
  );
}

export default EditTeacher;