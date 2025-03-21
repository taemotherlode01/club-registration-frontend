import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import './cooldown.css'; // Import the CSS file for styling

dayjs.extend(duration);

export default function Cooldown({ startDate, endDate, startTime, endTime }) {
    const [timeRemaining, setTimeRemaining] = useState(null);

    useEffect(() => {
        const updateTimer = () => {
            const now = dayjs();
            const start = dayjs(`${startDate.format('YYYY-MM-DD')}T${startTime.format('HH:mm:ss')}`);
            const end = dayjs(`${endDate.format('YYYY-MM-DD')}T${endTime.format('HH:mm:ss')}`);

            let diff;
            let status;
            if (now.isBefore(start)) {
                diff = start.diff(now);
                status = "เวลาที่เหลือก่อนเริ่มเลือกชุมนุม";
            } else if (now.isBefore(end)) {
                diff = end.diff(now);
                status = "เวลาที่เหลือก่อนหมดเวลาเลือกชุมนุม";
            } else {
                setTimeRemaining({ status: "หมดเวลาเลือกชุมนุม" });
                return;
            }

            const durationObj = dayjs.duration(diff);
            setTimeRemaining({
                status,
                days: Math.floor(durationObj.asDays()),
                hours: Math.floor(durationObj.asHours() % 24),
                minutes: Math.floor(durationObj.asMinutes() % 60),
                seconds: Math.floor(durationObj.asSeconds() % 60),
            });
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);

        return () => clearInterval(interval);
    }, [startDate, endDate, startTime, endTime]);

    if (!timeRemaining) return <div>กำลังโหลด...</div>;

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