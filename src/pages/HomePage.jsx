import React, { useState, useEffect } from 'react';
import Navbar from '../components/navbar/navbar_not_login/Navbar';
import { Table } from 'react-bootstrap';
import axios from 'axios';
import Footer from '../components/footer/Footer';
import CooldownShow from '../components/cooldownShow/CooldownShow';
import './HomePage.css'; // เพิ่มไฟล์ CSS สำหรับจัดการ layout

export default function HomePage() {
  const [allClubs, setAllClubs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmedSearchTerm, setConfirmedSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [clubMemberCounts, setClubMemberCounts] = useState({});
  const [combinedTimeData, setCombinedTimeData] = useState(null);

  useEffect(() => {
    fetchAllClubs();
    fetchClubMemberCounts();
    axios.get(`https://club-registration-backend-production.up.railway.app/combined_time_data`)
      .then(response => {
        console.log('Combined Time Data:', response.data);
        setCombinedTimeData(response.data);
      })
      .catch(error => {
        console.error('Error fetching combined time data:', error);
      });
  }, []);

  const thaiDateFormat = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

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

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      setConfirmedSearchTerm(searchTerm);
      setCurrentPage(1);
    }
  };

  const filteredClubs = allClubs.filter(club =>
    club.club_name.toLowerCase().includes(confirmedSearchTerm.toLowerCase())
  );

  const indexOfLastClub = currentPage * itemsPerPage;
  const indexOfFirstClub = indexOfLastClub - itemsPerPage;
  const currentClubs = filteredClubs.slice(indexOfFirstClub, indexOfLastClub);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const Pagination = ({ itemsPerPage, totalItems, paginate, currentPage }) => {
    const pageNumbers = [];
    for (let i = 1; i <= Math.ceil(totalItems / itemsPerPage); i++) {
      pageNumbers.push(i);
    }

    const maxPagesToShow = 5;
    let startPage, endPage;

    if (pageNumbers.length <= maxPagesToShow) {
      startPage = 1;
      endPage = pageNumbers.length;
    } else {
      const maxPagesBeforeCurrentPage = Math.floor(maxPagesToShow / 2);
      const maxPagesAfterCurrentPage = Math.ceil(maxPagesToShow / 2) - 1;

      if (currentPage <= maxPagesBeforeCurrentPage) {
        startPage = 1;
        endPage = maxPagesToShow;
      } else if (currentPage + maxPagesAfterCurrentPage >= pageNumbers.length) {
        startPage = pageNumbers.length - maxPagesToShow + 1;
        endPage = pageNumbers.length;
      } else {
        startPage = currentPage - maxPagesBeforeCurrentPage;
        endPage = currentPage + maxPagesAfterCurrentPage;
      }
    }

    return (
      <nav>
        <ul className="pagination">
          <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
            <button onClick={() => paginate(currentPage - 1)} className="page-link">
              ก่อนหน้า
            </button>
          </li>
          {pageNumbers.slice(startPage - 1, endPage).map((number) => (
            <li key={number} className={`page-item ${currentPage === number ? 'active' : ''}`}>
              <button onClick={() => paginate(number)} className="page-link">
                {number}
              </button>
            </li>
          ))}
          <li className={`page-item ${currentPage === pageNumbers.length ? 'disabled' : ''}`}>
            <button onClick={() => paginate(currentPage + 1)} className="page-link">
              ถัดไป
            </button>
          </li>
        </ul>
      </nav>
    );
  };

  return (
    <div className="page-wrapper">
      <Navbar />
      <div style={{ textAlign: 'center', margin: '20px' }}>
        {combinedTimeData && (
          <div className="row justify-content-center">
            {combinedTimeData.timeOpenData.map((data, index) => (
              <div className="col-md-4 mb-3" key={index}>
                <div className="card">
                  <div className="card-body d-flex flex-column justify-content-between">
                    <h5 className="card-title">เริ่ม</h5>
                    <p className="card-text">วันที่: {thaiDateFormat(data.date_of_open)}</p>
                  </div>
                </div>
              </div>
            ))}
            {combinedTimeData.endTimeOpenData.map((data, index) => (
              <div className="col-md-4 mb-3" key={index}>
                <div className="card">
                  <div className="card-body d-flex flex-column justify-content-between">
                    <h5 className="card-title">สิ้นสุด</h5>
                    <p className="card-text">วันที่: {thaiDateFormat(data.date_end)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px', marginBottom: '20px', padding: '0px 20px' }}>
        <CooldownShow />
      </div>

      <div className="container content-wrapper">
        <div className='d-flex flex-row bd-highlight mb-3'>
          <input
            type="text"
            className='form-control'
            placeholder="ค้นหาชุมนุม"
            value={searchTerm}
            onChange={handleSearchChange}
            onKeyDown={handleKeyPress}
            style={{ maxWidth: "500px" }}
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
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
        <Pagination
          itemsPerPage={itemsPerPage}
          totalItems={filteredClubs.length}
          paginate={paginate}
          currentPage={currentPage}
        />
      </div>
      <Footer />
    </div>
  );
}