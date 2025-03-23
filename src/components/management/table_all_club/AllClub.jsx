import React, { useEffect, useState } from 'react';
import { Table } from 'react-bootstrap';
import axios from 'axios';
import './AllClub.css';
import { FaEdit, FaTrash } from 'react-icons/fa';
import Swal from 'sweetalert2';

const AllClubs = () => {
  const [allClubs, setAllClubs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmedSearchTerm, setConfirmedSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => {
    fetchAllClubs();
  }, []);

  const fetchAllClubs = async () => {
    try {
      const [clubsResponse, studentCountResponse] = await Promise.all([
        axios.get("https://club-registration-backend-production.up.railway.app/all_clubs"),
        axios.get("https://club-registration-backend-production.up.railway.app/count_students_club")
      ]);

      const clubsData = clubsResponse.data;
      const studentCountData = studentCountResponse.data;

      const groupedClubs = groupByClubId(clubsData, studentCountData);
      setAllClubs(groupedClubs);
    } catch (error) {
      console.error(error);
    }
  };

  const groupByClubId = (clubsData, studentCountData) => {
    const groupedData = {};
    clubsData.forEach((club) => {
      if (!groupedData[club.club_id]) {
        groupedData[club.club_id] = {
          club_id: club.club_id,
          club_name: club.club_name,
          teachers: [],
          classes: [],
          student_count: 0
        };
      }

      const studentCountInfo = studentCountData.find(info => info.club_id === club.club_id);
      if (studentCountInfo) {
        groupedData[club.club_id].student_count = studentCountInfo.student_count;
      }

      groupedData[club.club_id].teachers.push({
        teacher_id: club.teacher_id,
        first_name: club.first_name,
        last_name: club.last_name,
      });
      groupedData[club.club_id].classes.push({
        class_name: club.class_name,
        open_to_receive: club.open_to_receive,
        number_of_member: club.number_of_member,
      });
    });
    return Object.values(groupedData);
  };

  const handleSelectItem = (e, clubId) => {
    const checked = e.target.checked;
    let newSelectedItems = [...selectedItems];
    if (checked) {
      newSelectedItems.push(clubId);
    } else {
      newSelectedItems = newSelectedItems.filter(id => id !== clubId);
    }
    setSelectedItems(newSelectedItems);
    setSelectAll(newSelectedItems.length === filteredClubs.length);
  };

  const handleSelectAll = (e) => {
    const checked = e.target.checked;
    setSelectAll(checked);
    const newSelectedItems = checked ? filteredClubs.map(club => club.club_id) : [];
    setSelectedItems(newSelectedItems);
  };

  const handleDeleteSelectedItems = async () => {
    if (selectedItems.length > 0) {
      const result = await Swal.fire({
        title: 'คุณแน่ใจหรือไม่?',
        text: `คุณต้องการลบชุมนุมที่เลือกทั้งหมด ${selectedItems.length} ชุมนุมหรือไม่?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'ใช่, ลบเลย!',
        cancelButtonText: 'ยกเลิก'
      });

      if (result.isConfirmed) {
        try {
          await axios.delete(`https://club-registration-backend-production.up.railway.app/delete_clubs`, {
            data: { clubIds: selectedItems }
          });
          fetchAllClubs();
          Swal.fire(
            'ลบแล้ว!',
            'ชุมนุมที่เลือกถูกลบเรียบร้อยแล้ว',
            'success'
          );
          setSelectedItems([]);
          setSelectAll(false);
        } catch (error) {
          console.error("Error deleting clubs:", error);
          Swal.fire(
            'เกิดข้อผิดพลาด!',
            'ไม่สามารถลบชุมนุมได้',
            'error'
          );
        }
      }
    } else {
      Swal.fire(
        'ไม่มีรายการที่เลือก',
        'กรุณาเลือกรายการที่ต้องการลบ',
        'warning'
      );
    }
  };

  const handleDeleteClub = async (clubId) => {
    const result = await Swal.fire({
      title: 'คุณแน่ใจหรือไม่?',
      text: 'คุณต้องการลบชุมนุมนี้หรือไม่?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'ใช่, ลบเลย!',
      cancelButtonText: 'ยกเลิก'
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`https://club-registration-backend-production.up.railway.app/delete_club/${clubId}`);
        fetchAllClubs();
        Swal.fire(
          'ลบแล้ว!',
          'ชุมนุมถูกลบเรียบร้อยแล้ว',
          'success'
        );
      } catch (error) {
        console.error("Error deleting club:", error);
        Swal.fire(
          'เกิดข้อผิดพลาด!',
          'ไม่สามารถลบชุมนุมได้',
          'error'
        );
      }
    }
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
    <div className="container">
      <div className='d-flex flex-row bd-highlight mb-3'>
        <input
          type="text"
          className="form-control mt-3"
          placeholder="ค้นหาชุมนุมด้วยชื่อ"
          value={searchTerm}
          onChange={handleSearchChange}
          onKeyDown={handleKeyPress}
        />
      </div>
      <div className="table-responsive">
        <button className='btn btn-danger' onClick={handleDeleteSelectedItems}>ลบรายการที่เลือก</button>
        <Table striped>
          <thead>
            <tr>
              <th>
                <input type="checkbox" onChange={handleSelectAll} checked={selectAll} />
              </th>
              <th style={{ minWidth: '150px' }}>ชื่อชุมชุม</th>
              <th style={{ minWidth: '150px' }}>อาจารย์ประจำชุมนุม</th>
              <th style={{ minWidth: '80px' }}>ชั้นที่รับ</th>
              <th style={{ minWidth: '80px' }}>จำนวนที่รับ</th>
              <th style={{ minWidth: '70px' }}>จำนวนสมาชิก</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {currentClubs.length > 0 ? (
              currentClubs.map((club) => (
                <tr key={club.club_id}>
                  <td>
                    <input
                      type="checkbox"
                      onChange={(e) => handleSelectItem(e, club.club_id)}
                      checked={selectedItems.includes(club.club_id)}
                    />
                  </td>
                  <td>{club.club_name}</td>
                  <td>
                    {club.teachers.map((teacher, index, array) => {
                      const fullName = `${teacher.first_name} ${teacher.last_name}`;
                      const isDuplicate = array.slice(index + 1).some(t => `${t.first_name} ${t.last_name}` === fullName);
                      return (
                        !isDuplicate && (
                          <span key={index}>
                            {fullName}
                            {index !== array.length - 1 && ', '}
                          </span>
                        )
                      );
                    })}
                  </td>
                  <td>
                    {club.classes
                      .filter((cls, index, self) =>
                        index === self.findIndex((c) => (
                          c.class_name === cls.class_name
                        ))
                      )
                      .map((cls, index, array) => (
                        <span key={index}>
                          {cls.class_name.replace('มัธยมศึกษาปีที่', 'ม.')}
                          {index !== array.length - 1 && ', '}
                        </span>
                      ))}
                  </td>
                  <td>{club.classes[0].open_to_receive}</td>
                  <td>{club.student_count}</td>
                  <td>
                    <button className='btn btn-danger' onClick={() => handleDeleteClub(club.club_id)}>
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center">
                  {confirmedSearchTerm === '' ? 'ค้นหา' : 'ไม่พบข้อมูล'}
                </td>
              </tr>
            )}
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
  );
};

export default AllClubs;