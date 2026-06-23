// src/components/admin/staff/StaffTable.tsx
import React from 'react';
import { Staff } from '../../types/staff';

interface Props {
    staff: Staff[];
    onEdit: (s: Staff) => void;
    onDelete: (s: Staff) => void;
    onResetPassword: (s: Staff) => void;
}

const roleLabel = (role: string) =>
    role === 'admin' ? (
        <span className="sm-badge sm-badge--admin">Quản lý</span>
    ) : (
        <span className="sm-badge sm-badge--staff">Thu ngân</span>
    );

const StaffTable: React.FC<Props> = ({ staff, onEdit, onDelete, onResetPassword }) => {
    if (staff.length === 0) {
        return (
            <div className="sm-empty">
                <svg viewBox="0 0 24 24" width="40" height="40"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                <p>Không có nhân viên nào</p>
            </div>
        );
    }

    return (
        <div className="sm-table-wrap">
            <table className="sm-table">
                <thead>
                <tr>
                    <th>Nhân viên</th>
                    <th>Email</th>
                    <th>Điện thoại</th>
                    <th>Vai trò</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                </tr>
                </thead>
                <tbody>
                {staff.map(s => (
                    <tr key={s.uid} className={!s.isActive ? 'sm-table__row--inactive' : ''}>
                        <td>
                            <div className="sm-staff-cell">
                                <div className="sm-staff-cell__avatar">
                                    {s.photoURL
                                        ? <img src={s.photoURL} alt="" />
                                        : <span>{s.fullName[0]?.toUpperCase()}</span>
                                    }
                                </div>
                                <span className="sm-staff-cell__name">{s.fullName}</span>
                            </div>
                        </td>
                        <td className="sm-table__mono">{s.email}</td>
                        <td>{s.phone || '—'}</td>
                        <td>{roleLabel(s.role)}</td>
                        <td>
                            {s.isActive
                                ? <span className="sm-status sm-status--active">Hoạt động</span>
                                : <span className="sm-status sm-status--inactive">Vô hiệu</span>
                            }
                        </td>
                        <td>
                            <div className="sm-actions">
                                <button
                                    className="sm-action-btn sm-action-btn--edit"
                                    onClick={() => onEdit(s)}
                                    title="Chỉnh sửa"
                                >
                                    <svg viewBox="0 0 24 24" width="15" height="15"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                </button>
                                <button
                                    className="sm-action-btn sm-action-btn--key"
                                    onClick={() => onResetPassword(s)}
                                    title="Reset mật khẩu"
                                >
                                    <svg viewBox="0 0 24 24" width="15" height="15"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                                </button>
                                <button
                                    className="sm-action-btn sm-action-btn--del"
                                    onClick={() => onDelete(s)}
                                    title={s.isActive ? 'Vô hiệu hóa' : 'Đã vô hiệu'}
                                    disabled={!s.isActive}
                                >
                                    <svg viewBox="0 0 24 24" width="15" height="15"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
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

export default StaffTable;