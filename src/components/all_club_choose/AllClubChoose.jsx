import React, { useEffect, useState } from 'react';
import { Table, Modal, Button } from 'react-bootstrap';
import './AllClub.css';
import axios from 'axios';
import dayjs from 'dayjs';

const AllClubChoose = ({ onClubSelection }) => {
  const [allClubs, setAllClubs] = useState([]);
  const [searchTerm, setSearchTerm] = useState(''); // ค่าที่ใช้ในการค้นหา
  const [tempSearchTerm, setTempSearchTerm] = useState(''); // ค่าชั่วคราวขณะพิมพ์
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [clubMemberCounts, setClubMemberCounts] = useState({});
  const [studentId, setStudentId] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedClubId, setSelectedClubId] = useState(null);
  const [alreadyChosen, setAlreadyChosen] = useState(false);
  const [studentClassId, setStudentClassId] = useState('');
  const [isWithinOpeningHours, setIsWithinOpeningHours] = useState(true);

  useEffect(() => {
    fetchAllClubs();
    fetchClubMemberCounts();
    const studentSession = localStorage.getItem('@student');
    if (studentSession) {
      const { id, class_id } = JSON.parse(studentSession);
      setStudentId(id);
      setStudentClassId(class_id);
    }
    fetchOpeningHours();
  }, []);

  useEffect(() => {
    const fetchAlreadyChosen = async () => {
      try {
        const response = await axios.get(`https://club-registration-backend-production.up.railway.app/student_already_chosen/${studentId}`);
        setAlreadyChosen(response.data.alreadyChosen);
      } catch (error) {
        console.error(error);
      }
    };

    if (studentId) {
      fetchAlreadyChosen();
    }
  }, [studentId]);

  const fetchAllClubs = async () => {
    try {
      const response = await axios.get("https://club-registration-backend-production.up.railway.app/all_clubs_student");
      const data = response.data;
      const groupedClubs = groupByClubId(data);
      setAllClubs(groupedClubs);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchClubMemberCounts = async () => {
    try {
      const response = await axios.get("https://club-registration-backend-production.up.railway.app/count_students_club");
      const data = response.data;
      const memberCounts = {};
      data.forEach((club) => {
        memberCounts[club.club_id] = club.student_count;
      });
      setClubMemberCounts(memberCounts);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchOpeningHours = async () => {
    try {
      const [startResponse, endResponse] = await Promise.all([
        axios.get("https://club-registration-backend-production.up.railway.app/get_time_open"),
        axios.get("https://club-registration-backend-production.up.railway.app/get_end_time_open")
      ]);

      if (startResponse.data.length > 0 && endResponse.data.length > 0) {
        const startData = startResponse.data[0];
        const endData = endResponse.data[0];

        const startDate = dayjs(startData.date_of_open).format('YYYY-MM-DD');
        const startTime = startData.time_open;
        const startDateTime = dayjs(`${startDate}T${startTime}`);

        const endDate = dayjs(endData.date_end).format('YYYY-MM-DD');
        const endTime = endData.time_end;
        const endDateTime = dayjs(`${endDate}T${endTime}`);

        const currentTime = dayjs();
        setIsWithinOpeningHours(currentTime >= startDateTime && currentTime <= endDateTime);

        // Set up interval to check opening hours every second
        const interval = setInterval(() => {
          const now = dayjs();
          setIsWithinOpeningHours(now >= startDateTime && now <= endDateTime);
        }, 1000);

        return () => clearInterval(interval);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const groupByClubId = (data) => {
    const groupedData = {};
    data.forEach((club) => {
      const clubId = club.club_id;
      if (!groupedData[clubId]) {
        groupedData[clubId] = {
          club_id: clubId,
          club_name: club.club_name,
          teachers: [],
          classes: [],
        };
      }

      const existingTeacherIndex = groupedData[clubId].teachers.findIndex(teacher => teacher.teacher_id === club.teacher_id);
      if (existingTeacherIndex === -1) {
        groupedData[clubId].teachers.push({
          teacher_id: club.teacher_id,
          first_name: club.first_name,
          last_name: club.last_name,
        });
      }

      const existingClassIndex = groupedData[clubId].classes.findIndex(cls => cls.class_name === club.class_name);
      if (existingClassIndex === -1) {
        groupedData[clubId].classes.push({
          class_id: club.class_id,
          class_name: club.class_name,
          open_to_receive: club.open_to_receive,
          number_of_member: club.number_of_member,
        });
      }
    });
    return Object.values(groupedData);
  };

  const filteredClubs = allClubs.filter(club =>
    club.club_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastClub = currentPage * itemsPerPage;
  const indexOfFirstClub = indexOfLastClub - itemsPerPage;
  const currentClubs = filteredClubs.slice(indexOfFirstClub, indexOfLastClub);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleSelectClub = async (clubId) => {
    setSelectedClubId(clubId);
    setShowModal(true);
  };

  const handleConfirmSelection = async () => {
    try {
      const response = await axios.post("https://club-registration-backend-production.up.railway.app/student_choose", {
        student_id: studentId,
        club_id: selectedClubId
      });
  
      if (response.status === 200) {
        console.log('Club selected:', selectedClubId);
  
        // อัปเดตจำนวนสมาชิกของชุมนุมที่เลือกทันที
        setClubMemberCounts(prevCounts => ({
          ...prevCounts,
          [selectedClubId]: (prevCounts[selectedClubId] || 0) + 1
        }));
  
        setAlreadyChosen(true);
        localStorage.setItem('clubSelection', 'selected');
        onClubSelection();
      } else {
        console.error('Failed to select club');
      }
    } catch (error) {
      console.error(error);
    }
    setShowModal(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      setSearchTerm(tempSearchTerm); // อัปเดต searchTerm เมื่อกด Enter
    }
  };

  if (!isWithinOpeningHours) {
    return <div style={{textAlign: "center"}}>ไม่ได้อยู่ในเวลาทำการ</div>;
  }

  return (
    <div className="container">
      <div className='d-flex flex-row bd-highlight mb-3'>
        <input
          type="text"
          className='form-control'
          placeholder="ค้นหาชุมนุม"
          value={tempSearchTerm}
          onChange={(e) => setTempSearchTerm(e.target.value)} // อัปเดต tempSearchTerm ขณะพิมพ์
          onKeyDown={handleKeyDown} // ตรวจสอบการกดปุ่ม
          style={{maxWidth:"500px"}}
        />
      </div>
      <h3>รายชื่อชุมนุม</h3>
      <div className="table-responsive">
        <Table striped bordered hover>
          <thead>
            <tr>
              <th style={{ minWidth: '150px' }}>ชื่อชุมนุม</th>
              <th style={{ minWidth: '150px' }}>ครูที่ปรึกษา</th>
              <th style={{ minWidth: '80px' }}>ชั้นที่รับ</th>
              <th style={{ minWidth: '80px' }}>จำนวนที่รับ</th>
              <th style={{ minWidth: '70px' }}>จำนวนสมาชิก</th>
              <th>เลือก</th>
            </tr>
          </thead>
          <tbody>
            {currentClubs.map((club) => (
              <tr key={club.club_id}>
                <td>{club.club_name}</td>
                <td>
                  {club.teachers.map((teacher, index) => (
                    <span key={index}>
                      {teacher.first_name} {teacher.last_name}
                      {index !== club.teachers.length - 1 && ', '}
                    </span>
                  ))}
                </td>
                <td>
                  {club.classes.map((cls, index) => (
                    <span key={index}>
                      {cls.class_name.replace('มัธยมศึกษาปีที่', 'ม.')}
                      {index !== club.classes.length - 1 && ', '}
                    </span>
                  ))}
                </td>
                <td>{club.classes[0].open_to_receive}</td>
                <td>{clubMemberCounts[club.club_id] || 0}</td>
                <td>
                  <button
                    className={`btn ${alreadyChosen || !club.classes.some(cls => cls.class_id === studentClassId) || (clubMemberCounts[club.club_id] || 0) >= club.classes[0].open_to_receive ? 'btn-danger' : 'btn-primary'}`}
                    onClick={() => handleSelectClub(club.club_id)}
                    disabled={alreadyChosen || !club.classes.some(cls => cls.class_id === studentClassId) || (clubMemberCounts[club.club_id] || 0) >= club.classes[0].open_to_receive}
                  >
                    {alreadyChosen || !club.classes.some(cls => cls.class_id === studentClassId) || (clubMemberCounts[club.club_id] || 0) >= club.classes[0].open_to_receive ? 'ล็อก' : 'เลือก'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
      <ul className="pagination">
        {[...Array(Math.ceil(filteredClubs.length / itemsPerPage)).keys()].map((number) => (
          <li key={number + 1} className="page-item">
            <button onClick={() => paginate(number + 1)} className="page-link">
              {number + 1}
            </button>
          </li>
        ))}
      </ul>
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>ยืนยันการเลือกชุมนุม</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          คุณแน่ใจหรือว่าจะเลือกชุมนุมนี้
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            ยกเลิก
          </Button>
          <Button variant="primary" onClick={handleConfirmSelection}>
            ยืนยัน
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AllClubChoose;