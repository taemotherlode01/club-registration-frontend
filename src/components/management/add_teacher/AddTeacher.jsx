import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Modal, Button } from 'react-bootstrap';
import Swal from 'sweetalert2';

function AddTeacher({ onClose }) {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone_number: '',
    email: '',
    password: '',
    role_id: ''
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
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('https://club-registration-backend-production.up.railway.app/add_teacher', formData);
      Swal.fire({
        icon: 'success',
        title: 'เพิ่มข้อมูลสำเร็จ!',
        text: 'ข้อมูลครูถูกเพิ่มเรียบร้อยแล้ว',
        confirmButtonText: 'ตกลง'
      });
      setFormData({
        first_name: '',
        last_name: '',
        phone_number: '',
        email: '',
        password: '',
        role_id: ''
      });
      onClose(); // ปิด Modal หลังจากสำเร็จ
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด!',
        text: 'เกิดข้อผิดพลาดในการเพิ่มข้อมูลครู',
        confirmButtonText: 'ตกลง'
      });
    }
  };

  return (
    <>
      <Modal.Header closeButton>
        <Modal.Title>เพิ่มครู</Modal.Title>
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

export default AddTeacher;