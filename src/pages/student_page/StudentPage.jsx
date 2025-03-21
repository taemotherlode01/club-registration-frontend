import React, { useState } from 'react';
import NavbarStudntLogin from '../../components/navbar/navbar_login_student/NavbarStudentLogin';
import AllClubChoose from '../../components/all_club_choose/AllClubChoose';
import ClubStudent from '../../components/club_student/ClubStudent';
import CooldownShow from '../../components/cooldownShow/CooldownShow';
export default function StudentPage() {
  const [refreshClubStudent, setRefreshClubStudent] = useState(false);

  const handleClubSelection = () => {
    setRefreshClubStudent(true);
  };

  return (
    <div>
      <NavbarStudntLogin />
            <div style={{display: 'flex', justifyContent: 'center', marginTop: '10px' , marginBottom: '20px' , padding: '20px 20px 0px 20px'}} >
      
      
            <CooldownShow />
            </div>
      <ClubStudent refresh={refreshClubStudent} />
      <AllClubChoose onClubSelection={handleClubSelection} />
    </div>
  );
}