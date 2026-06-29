// src/components/staff/shift/ShiftCard.tsx
import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { checkIn, checkOut, fetchMyAttendance } from '../../../store/myShiftSlice';
import { NOTE_MAX_LENGTH } from '../../../types/myShift';
// import './ShiftCard.css';

const ShiftCard: React.FC = () => {
    const dispatch = useAppDispatch();
    const { todayCheckIn, todayCheckOut, loading } = useAppSelector((state) => state.myShift);
    const [note, setNote] = useState('');
    const [error, setError] = useState<string | null>(null);

    // Lấy dữ liệu hôm nay khi mount
    useEffect(() => {
        dispatch(fetchMyAttendance());
    }, [dispatch]);

    const handleCheckIn = async () => {
        if (note.length > NOTE_MAX_LENGTH) {
            setError(`Ghi chú tối đa ${NOTE_MAX_LENGTH} ký tự`);
            return;
        }
        try {
            await dispatch(checkIn(note)).unwrap();
            setNote('');
            setError(null);
            // Refresh lại history để cập nhật trạng thái
            dispatch(fetchMyAttendance());
        } catch (err: any) {
            setError(err.message || 'Check-in thất bại');
        }
    };

    const handleCheckOut = async () => {
        if (note.length > NOTE_MAX_LENGTH) {
            setError(`Ghi chú tối đa ${NOTE_MAX_LENGTH} ký tự`);
            return;
        }
        try {
            await dispatch(checkOut(note)).unwrap();
            setNote('');
            setError(null);
            dispatch(fetchMyAttendance());
        } catch (err: any) {
            setError(err.message || 'Check-out thất bại');
        }
    };

    const isCheckedIn = !!todayCheckIn;
    const isCheckedOut = !!todayCheckOut;

    // Nếu đã check-out thì không hiển thị nữa
    const isComplete = isCheckedIn && isCheckedOut;

    return (
        <div className="shift-card">
            <h3 className="shift-card__title">Ca làm việc hôm nay</h3>
            {error && <div className="shift-card__error">{error}</div>}

            <div className="shift-card__status">
                {isComplete ? (
                    <div className="shift-card__complete">
                        ✅ Đã hoàn thành ca
                        <div>Check-in: {new Date(todayCheckIn!).toLocaleString('vi-VN')}</div>
                        <div>Check-out: {new Date(todayCheckOut!).toLocaleString('vi-VN')}</div>
                    </div>
                ) : (
                    <>
                        <div className="shift-card__info">
                            <span>Trạng thái: </span>
                            {isCheckedIn ? (
                                <span className="shift-card__checked-in">✅ Đã check-in lúc {new Date(todayCheckIn!).toLocaleTimeString('vi-VN')}</span>
                            ) : (
                                <span className="shift-card__not-checked">⏳ Chưa check-in</span>
                            )}
                        </div>

                        <div className="shift-card__note">
              <textarea
                  placeholder="Ghi chú (tối đa 200 ký tự)"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  maxLength={NOTE_MAX_LENGTH}
                  rows={2}
              />
                            <div className="shift-card__note-count">{note.length}/{NOTE_MAX_LENGTH}</div>
                        </div>

                        <div className="shift-card__actions">
                            {!isCheckedIn && (
                                <button
                                    className="shift-card__btn shift-card__btn--checkin"
                                    onClick={handleCheckIn}
                                    disabled={loading.checkIn}
                                >
                                    {loading.checkIn ? 'Đang xử lý...' : 'Check-in'}
                                </button>
                            )}
                            {isCheckedIn && !isCheckedOut && (
                                <button
                                    className="shift-card__btn shift-card__btn--checkout"
                                    onClick={handleCheckOut}
                                    disabled={loading.checkOut}
                                >
                                    {loading.checkOut ? 'Đang xử lý...' : 'Check-out'}
                                </button>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ShiftCard;