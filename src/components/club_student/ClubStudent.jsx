import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Modal, Button } from 'react-bootstrap';
import './ClubStudent.css';
export default function ClubStudent({ refresh }) {
  const [studentData, setStudentData] = useState(null);
  const [clubs, setClubs] = useState([]);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [clubIdToDelete, setClubIdToDelete] = useState(null);
  const [combinedTimeData, setCombinedTimeData] = useState(null);

  useEffect(() => {
    const studentSession = localStorage.getItem('@student');

    if (studentSession) {
      const parsedStudentData = JSON.parse(studentSession);
      setStudentData(parsedStudentData);

      axios.get(`https://club-registration-backend-production.up.railway.app/clubs_for_student/${parsedStudentData.id}`)
        .then(response => {
          setClubs(response.data);
        })
        .catch(error => {
          console.error('Error fetching clubs:', error);
        });

      axios.get(`https://club-registration-backend-production.up.railway.app/combined_time_data`)
        .then(response => {
          setCombinedTimeData(response.data);
        })
        .catch(error => {
          console.error('Error fetching combined time data:', error);
        });
    }
  }, [refresh]);

  const handleDeleteClub = async (clubId) => {
    try {
      await axios.delete(`https://club-registration-backend-production.up.railway.app/clubs_for_student/${studentData.id}`, {
        data: {
          club_id: clubId
        }
      });

      const response = await axios.get(`https://club-registration-backend-production.up.railway.app/clubs_for_student/${studentData.id}`);
      setClubs(response.data);

      // Reload the page to reflect the changes
      window.location.reload();
    } catch (error) {
      console.error('Error deleting club:', error);
    }
  };

  const handleShowConfirmationModal = (clubId) => {
    setClubIdToDelete(clubId);
    setShowConfirmationModal(true);
  };

  const handleCloseConfirmationModal = () => {
    setShowConfirmationModal(false);
  };

  const confirmDeleteClub = () => {
    if (clubIdToDelete) {
      handleDeleteClub(clubIdToDelete);
      setShowConfirmationModal(false);
    }
  };

  const thaiDateFormat = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div style={{ paddingTop: '20px', textAlign: 'center' }}>
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

      {clubs.length > 0 ? (
        <div className="row justify-content-center">
          {clubs.map(club => (
            <div className="col-md-4 mb-3" key={club.club_id}>
              <div className="card">
                <div className="card-body d-flex flex-column justify-content-between">
                  <h5 className="card-title">ชุมนุมของฉัน</h5>
                  <p className="card-text">{club.club_name}</p>
                  <div className="club-choose">{club.description?.trim() ? club.description : "-"}</div>
                  {/* <p className="card-text">{club.first_name} {club.last_name}</p> */}
                  {combinedTimeData && combinedTimeData.endTimeOpenData.some(data => new Date(data.date_end) > new Date()) ? (
                    <button onClick={() => handleShowConfirmationModal(club.club_id)} className="btn btn-danger">ออกจากชุมนุม</button>
                  ) : (
                    <p>ไม่สามารถออกจากชุมนุมได้</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="row justify-content-center">
          <div className="col-md-4 mb-3">
            <div className="card">
              <div className="card-body d-flex flex-column justify-content-between">
                <h5 className="card-title">ชุมนุมของฉัน</h5>
                <p className="card-text">ท่านยังไม่ได้เลือกชุมนุม</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <Modal show={showConfirmationModal} onHide={handleCloseConfirmationModal}>
        <Modal.Header closeButton>
          <Modal.Title>ยืนยันการออกจากชุมนุม</Modal.Title>
        </Modal.Header>
        <Modal.Body>คุณแน่ใจหรือไม่ที่จะออกจากชุมนุมนี้?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseConfirmationModal}>
            ยกเลิก
          </Button>
          <Button variant="danger" onClick={confirmDeleteClub}>
            ยืนยัน
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
