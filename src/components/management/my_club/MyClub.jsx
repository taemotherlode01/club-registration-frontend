import React, { useEffect, useState } from 'react';
import { Table, Modal, Button } from 'react-bootstrap';
import axios from 'axios';
import AddClub from '../add_club/AddClub';
import EditClub from '../edit_club/EditClub';
import { FaEdit, FaTrash, FaEye } from 'react-icons/fa';
import ClubSelectionDetail from '../detail_club/ClubSelectionDetail';
import Swal from 'sweetalert2';

const MyClub = () => {
  const [editingClub, setEditingClub] = useState(null);
  const [selectedClub, setSelectedClub] = useState(null);
  const [allClubs, setAllClubs] = useState([]);
  const [teacherId, setTeacherId] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showClubDetail, setShowClubDetail] = useState(false);
  const [updatedMemberCount, setUpdatedMemberCount] = useState(false);

  useEffect(() => {
    const teacherSession = localStorage.getItem('@teacher');
    if (teacherSession) {
      const { id } = JSON.parse(teacherSession);
      setTeacherId(id);
      setLoggedIn(true);
    } else {
      setLoggedIn(false);
    }
  }, []);

  useEffect(() => {
    if (loggedIn) {
      fetchAllClubs();
    }
  }, [loggedIn, updatedMemberCount]);

  const fetchAllClubs = async () => {
    try {
      const response = await axios.get(`https://club-registration-backend-production.up.railway.app/all_clubs?teacherId=${teacherId}`);
      const data = response.data;

      const studentCountResponse = await axios.get(`https://club-registration-backend-production.up.railway.app/count_students_club`);
      const studentCountData = studentCountResponse.data;

      const groupedClubs = groupByClubId(data, studentCountData);
      setAllClubs(groupedClubs);
    } catch (error) {
      console.error(error);
    }
  };

  const groupByClubId = (data, studentCountData) => {
    const groupedData = {};
    data.forEach((club) => {
      if (club.teacher_id === teacherId) {
        if (!groupedData[club.club_id]) {
          groupedData[club.club_id] = {
            club_id: club.club_id,
            club_name: club.club_name,
            description: club.description,
            teachers: [],
            classes: [],
            student_count: 0
          };
        }

        const studentCountInfo = studentCountData.find(info => info.club_id === club.club_id);
        if (studentCountInfo) {
          groupedData[club.club_id].student_count = studentCountInfo.student_count;
        }

        groupedData[club.club_id].classes.push({
          class_id: club.class_id,
          class_name: club.class_name,
          open_to_receive: club.open_to_receive,
          number_of_member: club.number_of_member,
        });
      }
    });

    data.forEach((club) => {
      if (groupedData[club.club_id]) {
        groupedData[club.club_id].teachers.push({
          teacher_id: club.teacher_id,
          first_name: club.first_name,
          last_name: club.last_name,
        });
      }
    });

    return Object.values(groupedData);
  };

  const handleDeleteClub = async (clubId) => {
    const result = await Swal.fire({
      title: 'คุณแน่ใจหรือไม่?',
      text: 'การลบชุมนุมนี้จะไม่สามารถกู้คืนได้!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'ลบ',
      cancelButtonText: 'ยกเลิก',
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`https://club-registration-backend-production.up.railway.app/delete_club/${clubId}`);
        await Swal.fire({
          title: 'ลบสำเร็จ!',
          text: 'ชุมนุมถูกลบเรียบร้อยแล้ว',
          icon: 'success',
          confirmButtonText: 'ตกลง',
        });
        fetchAllClubs();
      } catch (error) {
        console.error('Error deleting club:', error);
        await Swal.fire({
          title: 'เกิดข้อผิดพลาด!',
          text: 'ไม่สามารถลบชุมนุมได้ กรุณาลองอีกครั้ง',
          icon: 'error',
          confirmButtonText: 'ตกลง',
        });
      }
    }
  };

  const uniqueTeachers = (teachers) => {
    const unique = [];
    const uniqueIds = new Set();

    teachers.forEach((teacher) => {
      if (!uniqueIds.has(teacher.teacher_id)) {
        unique.push(teacher);
        uniqueIds.add(teacher.teacher_id);
      }
    });

    return unique;
  };

  const uniqueClasses = (classes) => {
    const unique = [];
    const uniqueNames = new Set();

    classes.forEach((cls) => {
      const className = cls.class_name;
      if (!uniqueNames.has(className)) {
        unique.push(cls);
        uniqueNames.add(className);
      }
    });

    return unique;
  };

  const handleViewClubDetails = (club) => {
    setSelectedClub(club);
    setShowClubDetail(true);
  };

  const handleCloseClubDetail = () => {
    setShowClubDetail(false);
  };

  const handleUpdateMemberCount = () => {
    setUpdatedMemberCount(prevState => !prevState);
  };

  return (
    <div className="container">
      <div className='d-flex flex-row bd-highlight mb-3'>
        <Button variant="success" className='mt-3' onClick={() => setShowAddForm(true)}>
          +สร้างชุมนุม
        </Button>
      </div>

            <Modal show={showAddForm} onHide={() => setShowAddForm(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>เพิ่มชุมนุม</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <AddClub
            updateClubs={fetchAllClubs}
            onClose={() => setShowAddForm(false)} // ส่งฟังก์ชัน onClose
          />
        </Modal.Body>
      </Modal>

      {/* Modal สำหรับแก้ไขชุมนุม */}
      <Modal show={!!editingClub} onHide={() => setEditingClub(null)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>แก้ไขชุมนุม</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <EditClub
            club={editingClub}
            updateClubs={fetchAllClubs}
            onCancel={() => setEditingClub(null)} // ส่งฟังก์ชัน onCancel
          />
        </Modal.Body>
      </Modal>

      <Modal show={showClubDetail} onHide={handleCloseClubDetail} size="xl">
        <Modal.Header closeButton>
          <Modal.Title>รายละเอียดชุมนุม</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ClubSelectionDetail club={selectedClub} onClose={handleCloseClubDetail} updateMemberCount={handleUpdateMemberCount} />
        </Modal.Body>
      </Modal>

      <div className="table-responsive">
        <Table striped>
          <thead>
            <tr>
              <th style={{ minWidth: '150px' }}>ชื่อชุมนุม</th>
              <th style={{ minWidth: '150px' }}>ครูที่ปรึกษาชุมนุม</th>
              <th style={{ minWidth: '100px' }}>ชั้นที่รับ</th>
              <th style={{ minWidth: '80px' }}>จำนวนที่รับ</th>
              <th style={{ minWidth: '120px' }}>จำนวนสมาชิก</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {allClubs.map((club) => (
              <tr key={club.club_id}>
                <td>{club.club_name}</td>
                <td>
                  <ul>
                    {uniqueTeachers(club.teachers).map((teacher, index) => (
                      <li key={index}>{teacher.first_name} {teacher.last_name}</li>
                    ))}
                  </ul>
                </td>
                <td>
                  {uniqueClasses(club.classes).map((cls, index) => (
                    <span key={index}>
                      {cls.class_name.replace('มัธยมศึกษาปีที่', 'ม.')}
                      {index !== uniqueClasses(club.classes).length - 1 && ', '}
                    </span>
                  ))}
                </td>
                <td>{club.classes[0].open_to_receive}</td>
                <td>{club.student_count}</td>
                <td>
                  <Button variant="danger" onClick={() => handleDeleteClub(club.club_id)}><FaTrash /></Button>{' '}
                  <Button variant="primary" onClick={() => setEditingClub(club)}><FaEdit /></Button>{' '}
                  <Button variant="info" onClick={() => handleViewClubDetails(club)}><FaEye /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </div>
  );
};

export default MyClub;