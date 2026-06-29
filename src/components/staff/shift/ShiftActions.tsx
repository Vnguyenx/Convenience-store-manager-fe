// src/components/staff/shift/ShiftActions.tsx
import React from 'react';

interface Props {
    isCheckedIn: boolean;
    isCheckedOut: boolean;
    loadingIn: boolean;
    loadingOut: boolean;
    onCheckIn: () => void;
    onCheckOut: () => void;
}

const ShiftActions: React.FC<Props> = ({
                                           isCheckedIn,
                                           isCheckedOut,
                                           loadingIn,
                                           loadingOut,
                                           onCheckIn,
                                           onCheckOut,
                                       }) => {
    if (isCheckedIn && isCheckedOut) {
        return null; // hoặc hiển thị thông báo đã hoàn thành
    }

    return (
        <div className="shift-actions">
            {!isCheckedIn && (
                <button
                    className="btn-checkin"
                    onClick={onCheckIn}
                    disabled={loadingIn}
                >
                    {loadingIn ? 'Đang xử lý...' : 'Check-in'}
                </button>
            )}
            {isCheckedIn && !isCheckedOut && (
                <button
                    className="btn-checkout"
                    onClick={onCheckOut}
                    disabled={loadingOut}
                >
                    {loadingOut ? 'Đang xử lý...' : 'Check-out'}
                </button>
            )}
        </div>
    );
};

export default ShiftActions;