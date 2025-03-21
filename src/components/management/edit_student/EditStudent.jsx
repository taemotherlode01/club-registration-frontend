import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import axios from 'axios';
import Swal from 'sweetalert2'; // นำเข้า SweetAlert2

function EditStudent({ show, onHide, studentData, onSuccess }) {
  // ตรวจสอบว่า studentData ไม่เป็น null
  if (!studentData) {
    return null; // หรือแสดงข้อความว่า "ไม่พบข้อมูลนักเรียน"
  }

  const [formData, setFormData] = useState({
    student_id: studentData.student_id,
    card_code: studentData.card_code,
    first_name: studentData.first_name,
    last_name: studentData.last_name,
    phone_number: studentData.phone_number,
    email: studentData.email,
    class_id: studentData.class_id,
    room_id: studentData.room_id
  });

  const [classList, setClassList] = useState([]);
  const [roomList, setRoomList] = useState([]);

  useEffect(() => {
    fetchClassList();
    fetchRoomList();
  }, []);

  const fetchClassList = async () => {
    try {
      const response = await axios.get('https://club-registration-backend-production.up.railway.app/class_list');
      setClassList(response.data);
    } catch (error) {
      console.error('Error fetching class list:', error);
    }
  };

  const fetchRoomList = async () => {
    try {
      const response = await axios.get('https://club-registration-backend-production.up.railway.app/room_list');
      setRoomList(response.data);
    } catch (error) {
      console.error('Error fetching room list:', error);
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
      const response = await axios.put(`https://club-registration-backend-production.up.railway.app/update_student/${formData.student_id}`, formData);

      // แสดง SweetAlert2 เมื่อแก้ไขข้อมูลสำเร็จ
      Swal.fire({
        icon: 'success',
        title: 'แก้ไขข้อมูลสำเร็จ!',
        text: 'ข้อมูลนักเรียนถูกแก้ไขเรียบร้อยแล้ว',
        confirmButtonText: 'ตกลง'
      });

      // รีเฟรชข้อมูลหลังจากแก้ไขสำเร็จ
      onSuccess();
    } catch (error) {
      // แสดง SweetAlert2 เมื่อเกิดข้อผิดพลาด
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด!',
        text: 'ไม่สามารถแก้ไขข้อมูลนักเรียนได้',
        confirmButtonText: 'ตกลง'
      });
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>แก้ไขข้อมูลนักเรียน</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <Form.Label>รหัสนักเรียน</Form.Label>
                <Form.Control type="text" name="student_id" value={formData.student_id} onChange={handleChange} disabled />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>เลขประจำตัวประชาชน</Form.Label>
                <Form.Control type="text" name="card_code" value={formData.card_code} onChange={handleChange} required />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>ชื่อ</Form.Label>
                <Form.Control type="text" name="first_name" value={formData.first_name} onChange={handleChange} />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>นามสกุล</Form.Label>
                <Form.Control type="text" name="last_name" value={formData.last_name} onChange={handleChange} />
              </Form.Group>
            </div>
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <Form.Label>เบอร์โทร</Form.Label>
                <Form.Control type="text" name="phone_number" value={formData.phone_number} onChange={handleChange} />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>อีเมล</Form.Label>
                <Form.Control type="email" name="email" value={formData.email} onChange={handleChange} />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>ชั้น</Form.Label>
                <Form.Select name="class_id" value={formData.class_id} onChange={handleChange} required>
                  <option value="">เลือกชั้น</option>
                  {classList.map((classItem) => (
                    <option key={classItem.class_id} value={classItem.class_id}>{classItem.class_name}</option>
                  ))}
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>ห้อง</Form.Label>
                <Form.Select name="room_id" value={formData.room_id} onChange={handleChange} required>
                  <option value="">เลือกห้อง</option>
                  {roomList.map((roomItem) => (
                    <option key={roomItem.room_id} value={roomItem.room_id}>{roomItem.room_name}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </div>
          </div>
          <Button type="submit" className="mt-3">บันทึก</Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
}

export default EditStudent;