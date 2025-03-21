import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import axios from 'axios';
import './CooldownShow.css'; // Import the CSS file for styling

dayjs.extend(duration);

export default function CooldownShow() {
    const [timeRemaining, setTimeRemaining] = useState(null);
    const [startDateTime, setStartDateTime] = useState(null);
    const [endDateTime, setEndDateTime] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [startResponse, endResponse] = await Promise.all([
                    axios.get("https://club-registration-backend-production.up.railway.app/get_time_open"),
                    axios.get("https://club-registration-backend-production.up.railway.app/get_end_time_open")
                ]);

                if (startResponse.data.length > 0 && endResponse.data.length > 0) {
                    const startData = startResponse.data[0];
                    const endData = endResponse.data[0];

                    // Combine date and time correctly from API data
                    const startDateTime = dayjs(startData.date_of_open).set('hour', parseInt(startData.time_open.split(':')[0])).set('minute', parseInt(startData.time_open.split(':')[1])).set('second', parseInt(startData.time_open.split(':')[2]));
                    const endDateTime = dayjs(endData.date_end).set('hour', parseInt(endData.time_end.split(':')[0])).set('minute', parseInt(endData.time_end.split(':')[1])).set('second', parseInt(endData.time_end.split(':')[2]));

                    setStartDateTime(startDateTime);
                    setEndDateTime(endDateTime);
                }
                setLoading(false);
            } catch (error) {
                setError(error.message);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        if (!startDateTime || !endDateTime) return;

        const updateTimer = () => {
            const now = dayjs();
            let diff;
            let status;

            if (now.isBefore(startDateTime)) {
                diff = startDateTime.diff(now); // ความต่างก่อนเริ่ม
                status = "เวลาที่เหลือก่อนเริ่มเลือกชุมนุม";
            } else if (now.isBefore(endDateTime)) {
                diff = endDateTime.diff(now); // ความต่างก่อนสิ้นสุด
                status = "เวลาที่เหลือก่อนหมดเวลาเลือกชุมนุม";
            } else {
                setTimeRemaining({ status: "หมดเวลาเลือกชุมนุม" });
                return;
            }

            const durationObj = dayjs.duration(diff);

            // คำนวณระยะเวลาทั้งหมดจากมิลลิวินาที
            const totalSeconds = Math.floor(durationObj.asSeconds());
            const days = Math.floor(totalSeconds / (24 * 60 * 60));
            const hours = Math.floor((totalSeconds % (24 * 60 * 60)) / (60 * 60));
            const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
            const seconds = totalSeconds % 60;

            setTimeRemaining({
                status,
                days,
                hours,
                minutes,
                seconds,
            });
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);

        return () => clearInterval(interval);
    }, [startDateTime, endDateTime]);

    if (loading) return <div>กำลังโหลด...</div>;
    if (error) return <div>เกิดข้อผิดพลาด: {error}</div>;
    if (!timeRemaining) return <div>ไม่มีข้อมูลเวลา</div>;

    return (
        <div className="cooldown">
            <h4>{timeRemaining.status}</h4>
            {timeRemaining.days !== undefined && (
                <div className="countdown">
                    <div className="flip-card">
                        <div className="flip-card-inner">
                            <div className="flip-card-front">{timeRemaining.days}</div>
                            <div className="flip-card-back">{timeRemaining.days}</div>
                        </div>
                        <div className="label">วัน</div>
                    </div>
                    <div className="flip-card">
                        <div className="flip-card-inner">
                            <div className="flip-card-front">{timeRemaining.hours}</div>
                            <div className="flip-card-back">{timeRemaining.hours}</div>
                        </div>
                        <div className="label">ชั่วโมง</div>
                    </div>
                    <div className="flip-card">
                        <div className="flip-card-inner">
                            <div className="flip-card-front">{timeRemaining.minutes}</div>
                            <div className="flip-card-back">{timeRemaining.minutes}</div>
                        </div>
                        <div className="label">นาที</div>
                    </div>
                    <div className="flip-card">
                        <div className="flip-card-inner">
                            <div className="flip-card-front">{timeRemaining.seconds}</div>
                            <div className="flip-card-back">{timeRemaining.seconds}</div>
                        </div>
                        <div className="label">วินาที</div>
                    </div>
                </div>
            )}
        </div>
    );
}