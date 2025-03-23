import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaEdit, FaTrash } from 'react-icons/fa';
import './AllStudent.css';
import AddStudent from '../add_student/AddStudent';
import EditStudent from '../edit_student/EditStudent';
import Swal from 'sweetalert2';
import { Modal, Button } from 'react-bootstrap';
import * as XLSX from 'xlsx';

function AllStudents() {
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmedSearchTerm, setConfirmedSearchTerm] = useState('');
  const [studentIdSearchTerm, setStudentIdSearchTerm] = useState('');
  const [confirmedStudentIdSearchTerm, setConfirmedStudentIdSearchTerm] = useState('');
  const [cardCodeSearchTerm, setCardCodeSearchTerm] = useState('');
  const [confirmedCardCodeSearchTerm, setConfirmedCardCodeSearchTerm] = useState('');
  const [selectedClassName, setSelectedClassName] = useState('');
  const [selectedRoomName, setSelectedRoomName] = useState('');
  const [isRoomNameDisabled, setIsRoomNameDisabled] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [roomNames, setRoomNames] = useState([]);
  const [sortBy, setSortBy] = useState('');
  const [file, setFile] = useState(null);
  const [isUploadDisabled, setIsUploadDisabled] = useState(true);
  const [uploadStatus, setUploadStatus] = useState('');
  const [selectAll, setSelectAll] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectedStudentData, setSelectedStudentData] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
    setIsUploadDisabled(!selectedFile);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      setConfirmedSearchTerm(searchTerm);
      setConfirmedStudentIdSearchTerm(studentIdSearchTerm);
      setConfirmedCardCodeSearchTerm(cardCodeSearchTerm);
      setCurrentPage(1);
    }
  };

  const handleDownloadTemplate = () => {
    const wb = XLSX.utils.book_new();
    const templateData = [
      { 
        "รหัสนักเรียน": 0, 
        "เลขประจำตัวประชาชน": "", 
        "ชื่อ": "", 
        "นามสกุล": "", 
        "เบอร์โทร": "", 
        "อีเมล": "", 
        "ชั้นเรียน": 0, 
        "ห้อง": 0 
      }
    ];
    const ws = XLSX.utils.json_to_sheet(templateData);
    ws['!cols'] = [
      { wch: 15 }, { wch: 25 }, { wch: 25 }, { wch: 25 }, 
      { wch: 15 }, { wch: 25 }, { wch: 15 }, { wch: 15 }
    ];
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "student_template.xlsx");
  };

  const handleUpload = async () => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      await axios.post("https://club-registration-backend-production.up.railway.app/upload_excel", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      Swal.fire({
        icon: 'success',
        title: 'อัปโหลดสำเร็จ!',
        text: 'ไฟล์ถูกอัปโหลดเรียบร้อยแล้ว',
        confirmButtonText: 'ตกลง'
      });
      fetchData();
    } catch (error) {
      console.error("Error uploading file:", error);
      Swal.fire({
        icon: 'error',
        title: 'อัปโหลดไม่สำเร็จ!',
        text: 'เกิดข้อผิดพลาดในการอัปโหลดไฟล์',
        confirmButtonText: 'ตกลง'
      });
    }
  };

  useEffect(() => {
    if (uploadStatus) {
      setTimeout(() => setUploadStatus(''), 3000);
    }
  }, [uploadStatus]);

  useEffect(() => {
    fetchData();
  }, [sortBy, showEditModal]);

  const fetchData = async () => {
    try {
      const response = await axios.get('https://club-registration-backend-production.up.railway.app/all_students');
      setStudents(response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleStudentIdSearchChange = (event) => {
    setStudentIdSearchTerm(event.target.value);
  };

  const handleCardCodeSearchChange = (event) => {
    setCardCodeSearchTerm(event.target.value);
  };

  const handleClassNameChange = (event) => {
    const selectedClassName = event.target.value;
    setSelectedClassName(selectedClassName);
    setSelectedRoomName('');
    setIsRoomNameDisabled(selectedClassName === '');

    const filteredStudentsByClassName = students.filter(student => selectedClassName === '' || student.class_name === selectedClassName);
    const uniqueRoomNames = Array.from(new Set(filteredStudentsByClassName.map(student => student.room_name)));
    setRoomNames(uniqueRoomNames);
  };

  const handleRoomNameChange = (event) => {
    setSelectedRoomName(event.target.value);
  };

  const handleSortChange = (sortByColumn) => {
    if (sortBy === sortByColumn) {
      setSortBy(`-${sortByColumn}`);
    } else {
      setSortBy(sortByColumn);
    }
  };

  const handleAddStudent = () => {
    setShowAddModal(true);
  };

  const handleCloseAddModal = () => {
    setShowAddModal(false);
    fetchData();
  };

  const handleEditStudent = (student) => {
    setSelectedStudentData(student);
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    fetchData();
  };

  const handleSelectAll = (e) => {
    const checked = e.target.checked;
    setSelectAll(checked);
    const newSelectedItems = checked ? currentItems.map(item => item.student_id) : [];
    setSelectedItems(newSelectedItems);
  };

  const handleDeleteSelectedItems = async () => {
    if (selectedItems.length > 0) {
      const result = await Swal.fire({
        title: 'คุณแน่ใจหรือไม่?',
        text: `คุณต้องการลบนักเรียนที่เลือกทั้งหมด ${selectedItems.length} คนหรือไม่?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'ใช่, ลบเลย!',
        cancelButtonText: 'ยกเลิก'
      });

      if (result.isConfirmed) {
        try {
          await axios.delete(`https://club-registration-backend-production.up.railway.app/delete_students`, {
            data: { studentIds: selectedItems }
          });
          fetchData();
          Swal.fire(
            'ลบแล้ว!',
            'นักเรียนที่เลือกถูกลบเรียบร้อยแล้ว',
            'success'
          );
          setSelectedItems([]);
          setSelectAll(false);
        } catch (error) {
          console.error("Error deleting students:", error);
          Swal.fire(
            'เกิดข้อผิดพลาด!',
            'ไม่สามารถลบนักเรียนได้',
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

  const handleDeleteStudent = async (studentId) => {
    try {
      const result = await Swal.fire({
        title: 'คุณแน่ใจหรือไม่?',
        text: "คุณต้องการลบนักเรียนคนนี้หรือไม่?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'ใช่, ลบเลย!',
        cancelButtonText: 'ยกเลิก'
      });

      if (result.isConfirmed) {
        await axios.delete(`https://club-registration-backend-production.up.railway.app/delete_student/${studentId}`);
        fetchData();
        Swal.fire(
          'ลบแล้ว!',
          'นักเรียนถูกลบเรียบร้อยแล้ว',
          'success'
        );
      }
    } catch (error) {
      console.error("Error deleting student:", error);
      Swal.fire(
        'เกิดข้อผิดพลาด!',
        'ไม่สามารถลบนักเรียนได้',
        'error'
      );
    }
  };

  const handleSelectItem = (e, studentId) => {
    const checked = e.target.checked;
    let newSelectedItems = [...selectedItems];
    if (checked) {
      newSelectedItems.push(studentId);
    } else {
      newSelectedItems = newSelectedItems.filter(id => id !== studentId);
    }
    setSelectedItems(newSelectedItems);
    setSelectAll(newSelectedItems.length === currentItems.length);
  };

  const compareValues = (key) => {
    return function (a, b) {
      if (!a.hasOwnProperty(key) || !b.hasOwnProperty(key)) {
        return 0;
      }

      const varA = typeof a[key] === 'string' ? a[key].toUpperCase() : a[key];
      const varB = typeof b[key] === 'string' ? b[key].toUpperCase() : b[key];

      let comparison = 0;
      if (varA > varB) {
        comparison = 1;
      } else if (varA < varB) {
        comparison = -1;
      }
      return key[0] === '-' ? comparison * -1 : comparison;
    };
  };

  const filteredStudents = students.filter((student) =>
    ['first_name', 'last_name'].some((key) =>
      typeof student[key] === 'string' && (
        student[key].toLowerCase().includes(confirmedSearchTerm.toLowerCase()) ||
        `${student.first_name.toLowerCase()} ${student.last_name.toLowerCase()}`.includes(confirmedSearchTerm.toLowerCase())
      )
    )
  ).filter((student) =>
    student.student_id.toString().includes(confirmedStudentIdSearchTerm) &&
    student.card_code.toString().includes(confirmedCardCodeSearchTerm) &&
    (selectedClassName === '' || student.class_name === selectedClassName) &&
    (selectedRoomName === '' || student.room_name === selectedRoomName)
  );

  const sortedStudents = sortBy ? [...filteredStudents].sort(compareValues(sortBy)) : filteredStudents;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedStudents.slice(indexOfFirstItem, indexOfLastItem);

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
    <div className="container" style={{ overflowX: "auto" }}>
      <div className='d-flex flex-row bd-highlight mb-3'>
        <div className="p-2 bd-highlight">
          <button className='btn btn-success' onClick={handleAddStudent}>+เพิ่มนักเรียน</button>
        </div>
        <div className="p-2 bd-highlight">
          <input type="file" className="form-control" onChange={handleFileChange} />
        </div>
        <div className="p-2 bd-highlight">
          <button onClick={handleUpload} className='btn btn-primary' disabled={isUploadDisabled}>
            Upload
          </button>
        </div>
        <div className="p-2 bd-highlight">
          <button onClick={handleDownloadTemplate} className='btn btn-secondary'>
            ดาวน์โหลดเทมเพลต
          </button>
        </div>
      </div>

      <AddStudent
        show={showAddModal}
        onHide={handleCloseAddModal}
        onSuccess={() => {
          setShowAddModal(false);
          fetchData();
        }}
      />

      <EditStudent
        show={showEditModal}
        onHide={handleCloseEditModal}
        studentData={selectedStudentData}
        onSuccess={() => {
          setShowEditModal(false);
          fetchData();
        }}
      />

      <h1>ข้อมูลนักเรียน</h1>
      <div className="row mb-3">
        <h5 style={{ marginTop: "20px" }}>ค้นหาแบบบุคคล</h5>
        <div className="col">
          <input
            type="text"
            className="form-control"
            placeholder="ชื่อ"
            value={searchTerm}
            onChange={handleSearchChange}
            onKeyDown={handleKeyPress}
          />
        </div>
        <div className="col">
          <input
            type="text"
            className="form-control"
            placeholder="รหัสนักเรียน"
            value={studentIdSearchTerm}
            onChange={handleStudentIdSearchChange}
            onKeyDown={handleKeyPress}
          />
        </div>
        <div className="col">
          <input
            type="text"
            className="form-control"
            placeholder="ประจำตัวประชาชน"
            value={cardCodeSearchTerm}
            onChange={handleCardCodeSearchChange}
            onKeyDown={handleKeyPress}
          />
        </div>
        <h6 style={{ marginTop: "20px" }}>เลือกชั้นเรียน</h6>
        <div className="col">
          <select className="form-select" value={selectedClassName} onChange={handleClassNameChange}>
            <option value="">เลือกชั้นเรียน</option>
            {Array.from(new Set(students.map(student => student.class_name))).map(className => (
              <option key={className} value={className}>{className}</option>
            ))}
          </select>
        </div>
        <div className="col" style={{ marginBottom: "10px" }}>
          <select className="form-select" value={selectedRoomName} onChange={handleRoomNameChange} disabled={isRoomNameDisabled}>
            <option value="">ทุกห้อง</option>
            {roomNames.map(roomName => (
              <option key={roomName} value={roomName}>{roomName}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="table-responsive" style={{ overflowX: "auto" }}>
        <button className='btn btn-danger' onClick={handleDeleteSelectedItems}>ลบรายการที่เลือก</button>
        <table className="table table-striped">
          <thead>
            <tr>
              <th>
                <input type="checkbox" onChange={handleSelectAll} checked={selectAll} />
              </th>
              <th onClick={() => handleSortChange('student_id')}>รหัสนักเรียน</th>
              <th onClick={() => handleSortChange('card_code')}>เลขประจำตัวประชาชน</th>
              <th onClick={() => handleSortChange('first_name')}>ชื่อ</th>
              <th onClick={() => handleSortChange('last_name')}>นามสกุล</th>
              <th>เบอร์โทร</th>
              <th>อีเมล</th>
              <th onClick={() => handleSortChange('class_name')}>ชั้นเรียน</th>
              <th onClick={() => handleSortChange('room_name')}>ห้อง</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length > 0 ? (
              currentItems.map((student) => (
                <tr key={student.student_id}>
                  <td>
                    <input
                      type="checkbox"
                      onChange={(e) => handleSelectItem(e, student.student_id)}
                      checked={selectedItems.includes(student.student_id)}
                    />
                  </td>
                  <td>{student.student_id}</td>
                  <td>{student.card_code}</td>
                  <td>{student.first_name}</td>
                  <td>{student.last_name}</td>
                  <td>{student.phone_number}</td>
                  <td>{student.email}</td>
                  <td>{student.class_name}</td>
                  <td>{student.room_name}</td>
                  <td>
                    <button
                      className="btn btn-primary"
                      style={{ fontSize: '0.6rem', marginRight: '2px' }}
                      onClick={() => handleEditStudent(student)}
                    >
                      <FaEdit className="mr-1" />
                    </button>
                    <button
                      className="btn btn-danger"
                      style={{ fontSize: '0.6rem' }}
                      onClick={() => handleDeleteStudent(student.student_id)}
                    >
                      <FaTrash className="mr-1" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="10" className="text-center">
                  {(
                    confirmedSearchTerm === '' &&
                    confirmedStudentIdSearchTerm === '' &&
                    confirmedCardCodeSearchTerm === '' &&
                    selectedClassName === '' &&
                    selectedRoomName === ''
                  ) ? 'ค้นหา' : 'ไม่พบข้อมูล'}
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <Pagination
          itemsPerPage={itemsPerPage}
          totalItems={sortedStudents.length}
          paginate={paginate}
          currentPage={currentPage}
        />
      </div>
    </div>
  );
}

export default AllStudents;