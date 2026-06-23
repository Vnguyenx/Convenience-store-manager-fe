// src/components/employees/AttendanceTable.tsx
import React from 'react';
import { Attendance, Staff } from '../../types/staff';

interface Props {
    records: Attendance[];
    staffList: Staff[];
    onEdit: (r: Attendance) => void;
    onDelete: (r: Attendance) => void;
}

function fmt(iso: string | null): string {
    if (!iso) return '—';
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const AttendanceTable: React.FC<Props> = ({ records, staffList, onEdit, onDelete }) => {
    const getStaffName = (uid: string) => staffList.find(s => s.uid === uid)?.fullName || uid;

    if (records.length === 0) {
        return (
            <div className="sm-empty">
                <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
                <p>Không có dữ liệu chấm công khớp với bộ lọc</p>
            </div>
        );
    }

    return (
        <div className="sm-table-wrap">
            <table className="sm-table">
                <thead>
                <tr>
                    <th>Nhân viên</th>
                    <th>Ngày</th>
                    <th>Giờ vào</th>
                    <th>Giờ ra</th>
                    <th>Số giờ</th>
                    <th>Ghi chú</th>
                    <th>Thao tác</th>
                </tr>
                </thead>
                <tbody>
                {records.map(r => (
                    <tr key={r.id}>
                        <td>{getStaffName(r.staffUid)}</td>
                        <td className="sm-table__mono">{r.date}</td>
                        <td className="sm-table__mono">{fmt(r.checkIn)}</td>
                        <td className="sm-table__mono">{fmt(r.checkOut)}</td>
                        <td className="sm-table__mono">{r.hoursWorked != null ? r.hoursWorked.toFixed(2) : '—'}</td>
                        <td>{r.note || '—'}</td>
                        <td>
                            <div className="sm-actions">
                                <button
                                    className="sm-action-btn sm-action-btn--edit"
                                    onClick={() => onEdit(r)}
                                    title="Chỉnh sửa"
                                >
                                    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                    </svg>
                                </button>
                                <button
                                    className="sm-action-btn sm-action-btn--del"
                                    onClick={() => onDelete(r)}
                                    title="Xóa bản ghi"
                                >
                                    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="3 6 5 6 21 6"/>
                                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                                        <path d="M10 11v6"/><path d="M14 11v6"/>
                                    </svg>
                                </button>
                            </div>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default AttendanceTable;
