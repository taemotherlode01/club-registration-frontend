import React from 'react'
import Card from 'react-bootstrap/Card';
import './CardManagementStyle.css';
import Student from '../../../assets/image_decorate/student.png';
import Teacher from '../../../assets/image_decorate/teacher.png';
import Pin from '../../../assets/image_decorate/pin.png';
import Clock from '../../../assets/image_decorate/clock.png';
import Club from '../../../assets/image_decorate/club.png';
import ClassRoom from '../../../assets/image_decorate/classroom.png';
export default function CardManagement() {
  return (
    <div className='container-card-management'>
     <Card style={{ width: '18rem', margin: '10px' }}>
      <Card.Body>
        <Card.Title>จัดการนักเรียน</Card.Title>
        <Card.Img variant="top" src={Student}  className='mx-auto img-fluid mb-3' style={{maxWidth: "100px", display: "block"}}/>
        <Card.Link href="/admin-dashboard/student-management">จัดการ</Card.Link>
      </Card.Body>

      
    </Card>

    <Card style={{ width: '18rem' ,margin: '10px'}}>
      <Card.Body>
        <Card.Title>จัดการครู</Card.Title>
        <Card.Img variant="top" src={Teacher}  className='mx-auto img-fluid mb-3' style={{maxWidth: "100px", display: "block"}}/>
        <Card.Link href="/admin-dashboard/teacher-management" className="card-link">จัดการ</Card.Link>
      </Card.Body>
    </Card>

    <Card style={{ width: '18rem' ,margin: '10px'}}>
      <Card.Body>
        <Card.Title>จัดการชุมนุม</Card.Title>
        <Card.Img variant="top" src={Club}  className='mx-auto img-fluid mb-3' style={{maxWidth: "100px", display: "block"}}/>

        <Card.Link href="/admin-dashboard/club-management" className="card-link">จัดการ</Card.Link>
      </Card.Body>
    </Card>
   
    </div>
  )
}
