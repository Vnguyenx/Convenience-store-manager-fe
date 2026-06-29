// src/components/staff/shift/ShiftStatus.tsx
import React from 'react';

interface Props {
    checkInTime: string | null;
    checkOutTime: string | null;
}

const ShiftStatus: React.FC<Props> = ({ checkInTime, checkOutTime }) => {
    const isCheckedIn = !!checkInTime;
    const isCheckedOut = !!checkOutTime;

    if (isCheckedIn && isCheckedOut) {
        return (
            <div className="shift-status complete">
                <span>✅ Đã hoàn thành ca</span>
                <div>Check-in: {new Date(checkInTime!).toLocaleString('vi-VN')}</div>
                <div>Check-out: {new Date(checkOutTime!).toLocaleString('vi-VN')}</div>
            </div>
        );
    }

    return (
        <div className="shift-status">
            <span>Trạng thái: </span>
            {isCheckedIn ? (
                <span className="checked-in">✅ Đã check-in lúc {new Date(checkInTime!).toLocaleTimeString('vi-VN')}</span>
            ) : (
                <span className="not-checked">⏳ Chưa check-in</span>
            )}
        </div>
    );
};

export default ShiftStatus;