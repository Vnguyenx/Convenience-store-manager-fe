// src/components/staff/shift/AttendanceHistory.tsx
import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { fetchMyAttendance } from '../../../store/myShiftSlice';
import { MyAttendanceFilters } from '../../../types/myShift';
// import './AttendanceHistory.css';

const AttendanceHistory: React.FC = () => {
    const dispatch = useAppDispatch();
    const { history, total, totalHours, loading } = useAppSelector((state) => state.myShift);
    const [filters, setFilters] = useState<MyAttendanceFilters>({});

    useEffect(() => {
        dispatch(fetchMyAttendance(filters));
    }, [dispatch, filters]);

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    const handleSearch = () => {
        dispatch(fetchMyAttendance(filters));
    };

    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('vi-VN');
    };

    const formatTime = (iso: string | null) => {
        if (!iso) return '--:--';
        return new Date(iso).toLocaleTimeString('vi-VN');
    };

    return (
        <div className="attendance-history">
            <h3 className="attendance-history__title">Lịch sử chấm công</h3>

            <div className="attendance-history__filters">
                <div className="filter-group">
                    <label>Từ ngày</label>
                    <input
                        type="date"
                        name="from"
                        value={filters.from || ''}
                        onChange={handleFilterChange}
                    />
                </div>
                <div className="filter-group">
                    <label>Đến ngày</label>
                    <input
                        type="date"
                        name="to"
                        value={filters.to || ''}
                        onChange={handleFilterChange}
                    />
                </div>
                <button className="filter-btn" onClick={handleSearch}>Lọc</button>
            </div>

            <div className="attendance-history__summary">
                <span>Tổng số bản ghi: {total}</span>
                <span>Tổng giờ làm: {totalHours.toFixed(2)} giờ</span>
            </div>

            {loading.history ? (
                <div className="loading">Đang tải...</div>
            ) : history.length === 0 ? (
                <div className="empty">Chưa có dữ liệu chấm công</div>
            ) : (
                <table className="attendance-history__table">
                    <thead>
                    <tr>
                        <th>Ngày</th>
                        <th>Check-in</th>
                        <th>Check-out</th>
                        <th>Số giờ</th>
                        <th>Ghi chú</th>
                    </tr>
                    </thead>
                    <tbody>
                    {history.map((record) => (
                        <tr key={record.id}>
                            <td>{formatDate(record.date)}</td>
                            <td>{formatTime(record.checkIn)}</td>
                            <td>{formatTime(record.checkOut)}</td>
                            <td>{record.hoursWorked ? record.hoursWorked.toFixed(2) : '--'}</td>
                            <td className="note-cell">{record.note || ''}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default AttendanceHistory;