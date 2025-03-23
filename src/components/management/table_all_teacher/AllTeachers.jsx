import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaEdit, FaTrash } from 'react-icons/fa';
import './AllTeacher.css';
import AddTeacher from '../add_teacher/AddTeacher';
import EditTeacher from '../edit_teacher/EditTeacher';
import Swal from 'sweetalert2';
import { Modal } from 'react-bootstrap';
import * as XLSX from 'xlsx';

function AllTeachers() {
  const [teachers, setTeachers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmedSearchTerm, setConfirmedSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [file, setFile] = useState(null);
  const [isUploadDisabled, setIsUploadDisabled] = useState(true);
  const [uploadStatus, setUploadStatus] = useState('');
  const [selectAll, setSelectAll] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [showEditTeacher, setShowEditTeacher] = useState(false);
  const [selectedTeacherData, setSelectedTeacherData] = useState(null);
  const [sortBy, setSortBy] = useState('');
  const [showAddTeacher, setShowAddTeacher] = useState(false);

  useEffect(() => {
    fetchData();
  }, [sortBy, showEditTeacher, showAddTeacher]);

  const fetchData = async () => {
    try {
      const response = await axios.get('https://club-registration-backend-production.up.railway.app/all_teachers');
      setTeachers(response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleDownloadTemplate = () => {
    const wb = XLSX.utils.book_new();
    const templateData = [
      { 
        "อีเมล": "", 
        "รหัสผ่าน": "", 
        "เบอร์โทร": "", 
        "ชื่อ": "", 
        "นามสกุล": "", 
        "รหัสบทบาท": 0,
      }
    ];
    const ws = XLSX.utils.json_to_sheet(templateData);
    ws['!cols'] = [
      { wch: 25 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 20 }, { wch: 10 },
    ];
    XLSX.utils.book_append_sheet(wb, ws, "Teacher Template");
    XLSX.writeFile(wb, "teacher_template.xlsx");
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      setConfirmedSearchTerm(searchTerm);
      setCurrentPage(1);
    }
  };

  const filteredTeachers = teachers.filter((teacher) => {
    const fullName = `${teacher.first_name} ${teacher.last_name}`.toLowerCase();
    return fullName.includes(confirmedSearchTerm.toLowerCase());
  });

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
    setIsUploadDisabled(!selectedFile);
  };

  const handleUpload = async () => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      await axios.post("https://club-registration-backend-production.up.railway.app/add_teachers_excel", formData, {
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
      setFile(null);
      setIsUploadDisabled(true);
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

  const handleEditTeacher = (teacher) => {
    setSelectedTeacherData(teacher);
    setShowEditTeacher(true);
  };

  const handleCloseEditTeacher = () => {
    setShowEditTeacher(false);
  };

  const handleAddTeacher = () => {
    setShowAddTeacher(true);
  };

  const handleCloseAddTeacher = () => {
    setShowAddTeacher(false);
  };

  const handleSelectAll = (e) => {
    const checked = e.target.checked;
    setSelectAll(checked);
    const newSelectedItems = checked ? currentItems.map(teacher => teacher.teacher_id) : [];
    setSelectedItems(newSelectedItems);
  };

  const handleDeleteSelectedItems = async () => {
    if (selectedItems.length > 0) {
      const result = await Swal.fire({
        title: 'คุณแน่ใจหรือไม่?',
        text: `คุณต้องการลบครูที่เลือกทั้งหมด ${selectedItems.length} คนหรือไม่?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'ใช่, ลบเลย!',
        cancelButtonText: 'ยกเลิก'
      });

      if (result.isConfirmed) {
        try {
          await axios.delete(`https://club-registration-backend-production.up.railway.app/delete_teachers`, {
            data: { teacherIds: selectedItems }
          });
          fetchData();
          Swal.fire(
            'ลบแล้ว!',
            'ครูที่เลือกถูกลบเรียบร้อยแล้ว',
            'success'
          );
          setSelectedItems([]);
          setSelectAll(false);
        } catch (error) {
          console.error("Error deleting teachers:", error);
          Swal.fire(
            'เกิดข้อผิดพลาด!',
            'ไม่สามารถลบครูได้',
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

  const handleDeleteTeacher = async (teacherId) => {
    const result = await Swal.fire({
      title: 'คุณแน่ใจหรือไม่?',
      text: "คุณต้องการลบครูคนนี้หรือไม่?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'ใช่, ลบเลย!',
      cancelButtonText: 'ยกเลิก'
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`https://club-registration-backend-production.up.railway.app/delete_teacher/${teacherId}`);
        fetchData();
        Swal.fire(
          'ลบแล้ว!',
          'ครูถูกลบเรียบร้อยแล้ว',
          'success'
        );
      } catch (error) {
        console.error("Error deleting teacher:", error);
        Swal.fire(
          'เกิดข้อผิดพลาด!',
          'ไม่สามารถลบครูได้',
          'error'
        );
      }
    }
  };

  const handleSelectItem = (e, teacherId) => {
    const checked = e.target.checked;
    let newSelectedItems = [...selectedItems];
    if (checked) {
      newSelectedItems.push(teacherId);
    } else {
      newSelectedItems = newSelectedItems.filter(id => id !== teacherId);
    }
    setSelectedItems(newSelectedItems);
    setSelectAll(newSelectedItems.length === currentItems.length);
  };

  const compareValues = (key) => {
    return function (a, b) {
      if (!a.hasOwnProperty(key) || !b.hasOwnProperty(key)) {
        return 0;
      }
      const varA = (typeof a[key] === 'string') ? a[key].toUpperCase() : a[key];
      const varB = (typeof b[key] === 'string') ? b[key].toUpperCase() : b[key];
      let comparison = 0;
      if (varA > varB) {
        comparison = 1;
      } else if (varA < varB) {
        comparison = -1;
      }
      return key[0] === '-' ? comparison * -1 : comparison;
    };
  };

  const sortedTeachers = sortBy ? [...filteredTeachers].sort(compareValues(sortBy)) : filteredTeachers;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedTeachers.slice(indexOfFirstItem, indexOfLastItem);

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
        <div className="p-2 bd-highlight">
          <button className='btn btn-success' onClick={handleAddTeacher}>+เพิ่มครู</button>
        </div>
        <div className="p-2 bd-highlight">
          <input type="file" className="form-control" onChange={handleFileChange} />
          {uploadStatus && (
            <div className={`alert ${uploadStatus === 'อัปโหลดสำเร็จ' ? 'alert-success' : 'alert-danger'}`} role="alert">
              {uploadStatus}
            </div>
          )}
        </div>
        <div className="p-2 bd-highlight">
          <button onClick={handleUpload} className='btn btn-primary' disabled={isUploadDisabled}>Upload</button>
        </div>
        <div className="p-2 bd-highlight">
          <button onClick={handleDownloadTemplate} className='btn btn-secondary'>
            ดาวน์โหลดเทมเพลต
          </button>
        </div>
      </div>
      <div className="row mb-3">
        <div className="col">
          <input
            type="text"
            className="form-control smaller-placeholder"
            placeholder="ค้นหาครูด้วยชื่อนามสกุล"
            value={searchTerm}
            onChange={handleSearchChange}
            onKeyDown={handleKeyPress}
          />
        </div>
      </div>
      <div className="table-responsive">
        <button className='btn btn-danger' onClick={handleDeleteSelectedItems}>ลบรายการที่เลือก</button>
        <table className="table table-striped">
          <thead>
            <tr>
              <th>
                <input type="checkbox" onChange={handleSelectAll} checked={selectAll} />
              </th>
              <th>ชื่อ</th>
              <th>นามสกุล</th>
              <th>อีเมล</th>
              <th>รหัสผ่าน</th>
              <th>เบอร์โทร</th>
              <th>สิทธิ</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length > 0 ? (
              currentItems.map((teacher) => (
                <tr key={teacher.teacher_id}>
                  <td>
                    <input
                      type="checkbox"
                      onChange={(e) => handleSelectItem(e, teacher.teacher_id)}
                      checked={selectedItems.includes(teacher.teacher_id)}
                    />
                  </td>
                  <td>{teacher.first_name}</td>
                  <td>{teacher.last_name}</td>
                  <td>{teacher.email}</td>
                  <td>{teacher.password}</td>
                  <td>{teacher.phone_number}</td>
                  <td>{teacher.role_name}</td>
                  <td>
                    <button className="btn btn-primary" onClick={() => handleEditTeacher(teacher)} style={{ marginRight: '5px' }}>
                      <FaEdit className="mr-1" />
                    </button>
                    <button className="btn btn-danger" onClick={() => handleDeleteTeacher(teacher.teacher_id)}>
                      <FaTrash className="mr-1" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="text-center">
                  {confirmedSearchTerm === '' ? 'ค้นหา' : 'ไม่พบข้อมูล'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <Pagination
        itemsPerPage={itemsPerPage}
        totalItems={filteredTeachers.length}
        paginate={paginate}
        currentPage={currentPage}
      />

      {/* Modal สำหรับเพิ่มครู */}
      <Modal show={showAddTeacher} onHide={handleCloseAddTeacher}>
        <AddTeacher onClose={handleCloseAddTeacher} />
      </Modal>

      {/* Modal สำหรับแก้ไขครู */}
      <Modal show={showEditTeacher} onHide={handleCloseEditTeacher}>
        <EditTeacher teacherData={selectedTeacherData} onRefresh={fetchData} onClose={handleCloseEditTeacher} />
      </Modal>
    </div>
  );
}

export default AllTeachers;