import React, { useState, useEffect } from 'react';
import Table from 'react-bootstrap/Table';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function CardCountStudentClass() {
  const [students, setStudents] = useState([]);

  useEffect(() => {
    fetch("https://club-registration-backend-production.up.railway.app/count_students")
      .then(response => response.json())
      .then(data => setStudents(data))
      .catch(error => console.error('Error fetching data:', error));
  }, []);

  const renderTable = () => {
    return (
      <Table className='mx-auto' striped bordered hover style={{ maxWidth: '400px', margin: "20px"}}>
        <thead>
          <tr>
            <th>ระดับชั้น</th>
            <th>จำนวนนักเรียน</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <tr key={student.class_name}>
              <td>{student.class_name}</td>
              <td>{student.student_count}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    );
  };

  return renderTable();
}
