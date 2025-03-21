import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import 'bootstrap/dist/css/bootstrap.min.css';
import Swal from 'sweetalert2';

function EditClub({ club, updateClubs, onCancel }) {
  // ตรวจสอบว่า club มีค่าหรือไม่
  if (!club) {
    return null; // หรือสามารถแสดงข้อความว่า "ไม่พบข้อมูลชุมนุม" แทนก็ได้
  }

  const [formData, setFormData] = useState({
    club_name: club.club_name,
    open_to_receive: club.classes[0].open_to_receive,
    teacher_id: club.teachers.map(teacher => teacher.teacher_id),
    class_id: club.classes.length > 0 ? club.classes.map(cls => cls.class_id) : [],
    description: club.description || '' // ตรวจสอบว่า description มีค่าหรือไม่
  });

  const [classList, setClassList] = useState([]);
  const [teacherList, setTeacherList] = useState([]);

  useEffect(() => {
    fetchClassList();
    fetchTeacherList();
  }, []);

  const fetchClassList = async () => {
    try {
      const response = await fetch('https://club-registration-backend-production.up.railway.app/class_list');
      if (response.ok) {
        const data = await response.json();
        const options = data.map(classItem => ({
          value: classItem.class_id,
          label: classItem.class_name
        }));
        setClassList(options);
      } else {
        console.error('Failed to fetch class list:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching class list:', error);
    }
  };

  const fetchTeacherList = async () => {
    try {
      const response = await fetch('https://club-registration-backend-production.up.railway.app/teacher_list');
      if (response.ok) {
        const data = await response.json();
        const options = data.map(teacher => ({
          value: teacher.teacher_id,
          label: `${teacher.first_name} ${teacher.last_name}`
        }));
        setTeacherList(options);
      } else {
        console.error('Failed to fetch teacher list:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching teacher list:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSelectChange = (selectedOptions) => {
    const selectedValues = selectedOptions.map(option => option.value);
    setFormData(prevData => ({
      ...prevData,
      class_id: selectedValues
    }));
  };

  const handleSelectChangeTeacher = (selectedOptions) => {
    const selectedValues = selectedOptions ? selectedOptions.map(option => option.value) : [];
    setFormData(prevData => ({
      ...prevData,
      teacher_id: selectedValues
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`https://club-registration-backend-production.up.railway.app/edit_club/${club.club_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer yourAuthToken', // Add your authentication token here if needed
        },
        body: JSON.stringify({
          club_name: formData.club_name,
          open_to_receive: formData.open_to_receive,
          description: formData.description, // ส่ง description ไปยัง API
          teacher_id: formData.teacher_id,
          class_id: formData.class_id,
        }),
      });
      if (response.ok) {
        console.log('Club updated successfully');

        // แสดง SweetAlert2 เมื่อแก้ไขชุมนุมสำเร็จ
        await Swal.fire({
          icon: 'success',
          title: 'แก้ไขชุมนุมสำเร็จ!',
          text: 'ชุมนุมถูกแก้ไขเรียบร้อยแล้ว',
          confirmButtonText: 'ตกลง',
        });

        // เมื่อแก้ไขชุมนุมสำเร็จ ให้เรียกใช้ฟังก์ชัน updateClubs เพื่ออัปเดตข้อมูลใน MyClub
        updateClubs();

        // ปิด Modal โดยเรียกใช้ฟังก์ชัน onCancel ที่ส่งผ่าน props
        onCancel();
      } else {
        console.error('Failed to update club:', response.statusText);
        await Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด!',
          text: 'ไม่สามารถแก้ไขชุมนุมได้',
          confirmButtonText: 'ตกลง',
        });
        // ไม่เรียก onCancel ในกรณีที่เกิดข้อผิดพลาด
      }
    } catch (error) {
      console.error('Error updating club:', error);
      await Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด!',
        text: 'ไม่สามารถแก้ไขชุมนุมได้',
        confirmButtonText: 'ตกลง',
      });
      // ไม่เรียก onCancel ในกรณีที่เกิดข้อผิดพลาด
    }
  };

  return (
    <div className="container px-5">
      <h2>แก้ไขชุมนุม</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>ชื่อชุมนุม</label>
          <input
            type="text"
            className="form-control"
            name="club_name"
            value={formData.club_name}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group mt-2">
          <label>จำนวนที่รับ</label>
          <input
            type="number"
            className="form-control"
            name="open_to_receive"
            value={formData.open_to_receive}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group mt-2">
          <label>คำอธิบายชุมนุม</label>
          <textarea
            className="form-control"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows="4"
            required
          />
        </div>
        <div className="form-group mt-2">
          <label>เลือกครูที่ปรึกษาชุมนุม</label>
          <Select
            options={teacherList}
            isMulti
            onChange={handleSelectChangeTeacher}
            value={teacherList.filter(option => formData.teacher_id.includes(option.value))}
          />
        </div>
        <div className="form-group mt-2">
          <label>ชั้นที่เลือกได้</label>
          <Select
            options={classList}
            isMulti
            onChange={handleSelectChange}
            value={classList.filter(option => formData.class_id.includes(option.value))}
          />
        </div>
        <div className="d-flex justify-content-start mt-3 my-4">
          <button type="submit" className="btn btn-primary">บันทึกการแก้ไข</button>
          <button type="button" className="btn btn-secondary mx-2" onClick={onCancel}>ยกเลิก</button>
        </div>
      </form>
    </div>
  );
}

export default EditClub;