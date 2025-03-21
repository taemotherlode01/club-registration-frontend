import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { useReactToPrint } from 'react-to-print';
import jsPDF from 'jspdf';
import { FaFileExcel, FaPrint, FaTimes } from 'react-icons/fa';
import "./ClubSelectionDetail.css";

export default function ClubSelectionDetail({ club, onClose ,updateMemberCount }) {
  const [clubData, setClubData] = useState(null);
  const [memberCount, setMemberCount] = useState(0);
  const [searchText, setSearchText] = useState('');
  const componentRef = useRef();

  useEffect(() => {
    const fetchClubData = async () => {
      try {
        const response = await axios.get(`https://club-registration-backend-production.up.railway.app/student_club/${club.club_id}`);
        setClubData(response.data);
        setMemberCount(response.data.length);
      } catch (error) {
        console.error('Error fetching club data:', error);
      }
    };

    if (club) {
      fetchClubData();
    }
  }, [club]);

  const exportToExcel = () => {
    if (clubData) {
      const dataForExcel = clubData.map((student, index) => ({
        'ลำดับ': index + 1,
        'รหัสนักเรียน': student.student_id,
        'ชื่อ': student.first_name,
        'นามสกุล': student.last_name,
        'เบอร์โทร': student.phone_number,
        'อีเมล': student.email,
        'ชั้น': student.class_name,
        'ห้อง': student.room_name
      }));

      const worksheet = XLSX.utils.json_to_sheet(dataForExcel);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Club Members');
      XLSX.writeFile(workbook, 'club_members.xlsx');
    }
  };

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  const exportToPDF = () => {
    if (clubData) {
      const doc = new jsPDF();
      doc.text(`Club Name: ${club.club_name}`, 10, 10);
      doc.autoTable({ html: '#club-members-table' });
      doc.save('club_members.pdf');
    }
  };

  const handleDelete = async (studentId) => {
    try {
      // Filter out the deleted student from clubData
      setClubData(prevClubData => prevClubData.filter(student => student.student_id !== studentId));
      // Delete the student from the backend
      await axios.delete(`https://club-registration-backend-production.up.railway.app/delete_students_club/${studentId}`);
      // Update the member count
      setMemberCount(prevCount => prevCount - 1);
      // Call the function to update member count in MyClub component
      updateMemberCount();
    } catch (error) {
      console.error('Error deleting student:', error);
    }
  };
  

  const filteredClubData = clubData ? clubData.filter(student =>
    (student.student_id && student.student_id.toString().toLowerCase().includes(searchText.toLowerCase())) ||
    `${student.first_name.toLowerCase()} ${student.last_name.toLowerCase()}`.includes(searchText.toLowerCase())
  ) : [];

  return (
    <div>
       <div className='my-3 d-flex flex-column align-items-center align-items-md-start justify-content-center flex-wrap'>
      <div className="mx-2">
        <button onClick={exportToExcel} className='btn btn-success'><FaFileExcel className="mr-1" /> ส่งออกเป็น Excel</button>
        <button onClick={handlePrint} className='btn btn-primary mx-1'><FaPrint className="mr-1" />Print</button>
        <button onClick={onClose} className='btn btn-secondary'><FaTimes className="mr-1" /></button>
      </div>
      <input
        type="text"
        placeholder="ค้นหาตามชื่อ หรือ รหัสนักเรียน"
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        className="form-control mt-3 mx-3"
        style={{ width: "300px" }}
      />
    </div>
      <div className="table-container">
        {clubData ? (
          <div ref={componentRef} style={{ fontFamily: "Noto Serif Thai"}} className='container-print'>
            <div className='club-name'>
            <h5>ชุมนุม {club.club_name}</h5>
            <p className='mx-4'>จำนวนนักเรียน: {memberCount}</p>
            </div>
            <table className="table table-bordered table-st">
              <thead>
                <tr>
                  <th style={{ backgroundColor: '#f2f2f2' }}>ลำดับ</th>
                  <th style={{ backgroundColor: '#f2f2f2' }}>รหัสนักเรียน</th>
                  <th style={{ backgroundColor: '#f2f2f2' }}>ชื่อ-นามสกุล</th>
                  <th style={{ backgroundColor: '#f2f2f2' }}>เบอร์โทร</th>
                  <th style={{ backgroundColor: '#f2f2f2' }}>อีเมล</th>
                  <th style={{ backgroundColor: '#f2f2f2' }}>ชั้น</th>
                  <th style={{ backgroundColor: '#f2f2f2' }}>ห้อง</th>
                  <th style={{ backgroundColor: '#f2f2f2' }} className='delete-column'>ถอน</th>
                </tr>
              </thead>
              <tbody>
                {filteredClubData.map((student, index) => (
                  <tr key={student.student_id}>
                    <td>{index + 1}</td>
                    <td>{student.student_id}</td>
                    <td>{student.first_name} {student.last_name}</td>
                    <td>{student.phone_number}</td>
                    <td>{student.email}</td>
                    <td>{student.class_name}</td>
                    <td>{student.room_name}</td>
                    <td className="delete-column">
                      <button onClick={() => handleDelete(student.student_id)} className='btn btn-danger btn-sm' style={{fontSize: "10px"}}>ถอน</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>Loading...</p>
        )}
      </div>
    </div>
  );
}
