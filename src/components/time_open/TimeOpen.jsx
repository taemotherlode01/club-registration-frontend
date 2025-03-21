import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Form, Button, Alert, Card, Row, Col } from 'react-bootstrap';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { TimePicker, DatePicker } from '@mui/x-date-pickers';
import { renderTimeViewClock } from '@mui/x-date-pickers/timeViewRenderers';
import dayjs from 'dayjs';
import 'dayjs/locale/th'; // Import Thai locale
import Cooldown from '../cooldown/cooldown'; // Import Cooldown component

dayjs.locale('th'); // Set dayjs locale to Thai

export default function TimeOpen() {
    const [timeOpenData, setTimeOpenData] = useState([]);
    const [dateOfOpen, setDateOfOpen] = useState(dayjs());
    const [timeOfOpen, setTimeOfOpen] = useState(dayjs());
    const [timeOpenId, setTimeOpenId] = useState('65');
    const [timeEndOpenData, setTimeEndOpenData] = useState([]);
    const [dateEndOfOpen, setDateEndOfOpen] = useState(dayjs());
    const [timeEndOfOpen, setTimeEndOfOpen] = useState(dayjs());
    const [endTimeOpenId, setEndTimeOpenId] = useState('1');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        fetchTimeOpen();
        fetchEndTimeOpen();
    }, []);

    const fetchTimeOpen = async () => {
        try {
            const response = await axios.get("https://club-registration-backend-production.up.railway.app/get_time_open");
            setTimeOpenData(response.data);
            if (response.data.length > 0) {
                setDateOfOpen(dayjs(response.data[0].date_of_open));
                setTimeOfOpen(dayjs(response.data[0].time_open, 'HH:mm'));
            }
        } catch (error) {
            console.error(error);
        }
    };

    const fetchEndTimeOpen = async () => {
        try {
            const response = await axios.get("https://club-registration-backend-production.up.railway.app/get_end_time_open");
            setTimeEndOpenData(response.data);
            if (response.data.length > 0) {
                setDateEndOfOpen(dayjs(response.data[0].date_end));
                setTimeEndOfOpen(dayjs(response.data[0].time_end, 'HH:mm'));
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleSubmitSetTime = async (e) => {
        e.preventDefault();
        try {
            const startDate = new Date(dateOfOpen);
            const endDate = new Date(dateEndOfOpen);
    
            if (endDate <= startDate) {
                setError("วันที่สิ้นสุดต้องมากกว่าวันที่เริ่มต้น");
                return;
            }
    
            // Combine date and time into a single datetime string
            const dateTimeOfOpen = `${dateOfOpen.format('YYYY-MM-DD')}T${timeOfOpen.format('HH:mm')}`;
            const dateTimeEndOfOpen = `${dateEndOfOpen.format('YYYY-MM-DD')}T${timeEndOfOpen.format('HH:mm')}`;
    
            const responseStart = await axios.post(`https://club-registration-backend-production.up.railway.app/update_time_open/${timeOpenId}`, {
                date_of_open: dateTimeOfOpen,
                time_open: timeOfOpen.format('HH:mm')
            });
    
            const responseEnd = await axios.post(`https://club-registration-backend-production.up.railway.app/update_end_time_open/${endTimeOpenId}`, {
                date_end: dateTimeEndOfOpen,
                time_end: timeEndOfOpen.format('HH:mm')
            });
    
            if (responseStart.status === 200 && responseEnd.status === 200) {
                setSuccess("วันที่และเวลาที่เริ่มต้นและสิ้นสุดถูกอัปเดตเรียบร้อยแล้ว");
                fetchTimeOpen();
                fetchEndTimeOpen();
                setIsEditing(false);
            } else {
                setError("ไม่สามารถอัปเดตวันที่หรือเวลาที่เริ่มต้นหรือสิ้นสุดได้");
            }
        } catch (error) {
            setError(`Error: ${error.response ? error.response.data : error.message}`);
        }
    };

    const handleEditClick = () => {
        setIsEditing(true);
    };

    const handleCancelClick = () => {
        setIsEditing(false);
        fetchTimeOpen();
        fetchEndTimeOpen();
    };

    return (

        <div>

            <div style={{display: 'flex', justifyContent: 'center', marginTop: '20px'}}>
           <Cooldown 
                startDate={dateOfOpen} 
                endDate={dateEndOfOpen} 
                startTime={timeOfOpen} 
                endTime={timeEndOfOpen} 
            /> 

            </div>  
        <Card style={{ maxWidth: '600px', margin: 'auto', marginTop: "20px" }}>

          
            <Card.Body>
                <div className='text-center'>
                    <h3 className='mt-3'>ตั้งเวลาเลือกชุมนุม</h3>
                    {success && (
                        <Alert variant="success" onClose={() => setSuccess('')} dismissible>
                            {success}
                        </Alert>
                    )}
                    {error && (
                        <Alert variant="danger" onClose={() => setError('')} dismissible>
                            {error}
                        </Alert>
                    )}
                    <ul style={{ listStyleType: 'none' }}>
                        {timeOpenData.map((item, index) => (
                            <li key={index}>เริ่ม: {new Date(item.date_of_open).toLocaleDateString()} เวลา: {item.time_open}</li>
                        ))}
                    </ul>
                    <ul style={{ listStyleType: 'none' }}>
                        {timeEndOpenData.map((item, index) => (
                            <li key={index}>สิ้นสุด: {new Date(item.date_end).toLocaleDateString()} เวลา: {item.time_end}</li>
                        ))}
                    </ul>
                    <Form onSubmit={handleSubmitSetTime} className="text-center">
                        <Row>
                            <Col>
                                <Form.Group controlId="dateOfOpen">
                                    <Form.Label>เลือกวันเริ่มต้น</Form.Label>
                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                        <DatePicker
                                            value={dateOfOpen}
                                            onChange={(newValue) => setDateOfOpen(newValue)}
                                            renderInput={(params) => <Form.Control {...params} required disabled={!isEditing} />}
                                            format="DD/MM/YYYY"
                                            disabled={!isEditing}
                                        />
                                    </LocalizationProvider>
                                </Form.Group>
                            </Col>
                            <Col>
                                <Form.Group controlId="timeOfOpen">
                                    <Form.Label>เลือกเวลาเริ่มต้น</Form.Label>
                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                        <TimePicker
                                            value={timeOfOpen}
                                            onChange={(newValue) => setTimeOfOpen(newValue)}
                                            viewRenderers={{
                                                hours: renderTimeViewClock,
                                                minutes: renderTimeViewClock,
                                                seconds: renderTimeViewClock,
                                            }}
                                            renderInput={(params) => <Form.Control {...params} required disabled={!isEditing} />}
                                            ampm={false}
                                            format="HH:mm"
                                            disabled={!isEditing}
                                        />
                                    </LocalizationProvider>
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <Form.Group controlId="dateEndOfOpen">
                                    <Form.Label>เลือกวันสิ้นสุด</Form.Label>
                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                        <DatePicker
                                            value={dateEndOfOpen}
                                            onChange={(newValue) => setDateEndOfOpen(newValue)}
                                            renderInput={(params) => <Form.Control {...params} required disabled={!isEditing} />}
                                            format="DD/MM/YYYY"
                                            disabled={!isEditing}
                                        />
                                    </LocalizationProvider>
                                </Form.Group>
                            </Col>
                            <Col>
                                <Form.Group controlId="timeEndOfOpen">
                                    <Form.Label>เลือกเวลาสิ้นสุด</Form.Label>
                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                        <TimePicker
                                            value={timeEndOfOpen}
                                            onChange={(newValue) => setTimeEndOfOpen(newValue)}
                                            viewRenderers={{
                                                hours: renderTimeViewClock,
                                                minutes: renderTimeViewClock,
                                                seconds: renderTimeViewClock,
                                            }}
                                            renderInput={(params) => <Form.Control {...params} required disabled={!isEditing} />}
                                            ampm={false}
                                            format="HH:mm"
                                            disabled={!isEditing}
                                        />
                                    </LocalizationProvider>
                                </Form.Group>
                            </Col>
                        </Row>
                        {isEditing ? (
                            <>
                                <Button variant="primary" type="submit" className='mt-3' style={{marginRight: '10px'}}>
                                    ตั้งเวลา
                                </Button>
                                <Button variant="secondary" onClick={handleCancelClick} className='mt-3 ml-2'>
                                    ยกเลิก
                                </Button>
                            </>
                        ) : (
                            <Button variant="warning" onClick={handleEditClick} className='mt-3'>
                                แก้ไขเวลา
                            </Button>
                        )}
                    </Form>
                </div>
            </Card.Body>
        </Card>
        </div>
    );
}