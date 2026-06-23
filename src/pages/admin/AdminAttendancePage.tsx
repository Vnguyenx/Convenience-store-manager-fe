// src/pages/admin/AdminAttendancePage.tsx
import React, { useEffect, useState, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
    fetchAllAttendance, updateAttendance, deleteAttendance, fetchAllStaff,
    setAttendancePage, setAttendancePageSize,
} from '../../store/staffSlice';
import { Attendance } from '../../types/staff';
import AppBar from '../../components/layout/AppBar';
import AdminSidebar from '../../components/layout/AdminSidebar';
import AttendanceTable from '../../components/employees/AttendanceTable';
import AttendanceEditModal from '../../components/employees/AttendanceEditModal';
import Pagination from '../../components/employees/Pagination';
import '../../styles/admin/adminEmployees.css';

function todayStr() {
    return new Date().toISOString().split('T')[0];
}
function firstOfMonth() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
}

const AdminAttendancePage: React.FC = () => {
    const dispatch = useAppDispatch();
    const {
        attendanceList, attendanceSummary, attendanceLoading, attendanceError, attendancePagination,
        staffList,
    } = useAppSelector(s => s.staff);

    const [filterStaffUid, setFilterStaffUid] = useState('');
    const [from, setFrom] = useState(firstOfMonth());
    const [to, setTo] = useState(todayStr());

    const [editTarget, setEditTarget] = useState<Attendance | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Attendance | null>(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [toast, setToast] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null);

    useEffect(() => {
        dispatch(fetchAllStaff({}));
    }, []);

    useEffect(() => {
        dispatch(fetchAllAttendance({
            staffUid: filterStaffUid || undefined,
            from: from || undefined,
            to: to || undefined,
        }));
    }, [filterStaffUid, from, to]);

    const showToast = (type: 'ok' | 'err', msg: string) => {
        setToast({ type, msg });
        setTimeout(() => setToast(null), 3200);
    };

    const { page, pageSize } = attendancePagination;
    const pagedList = useMemo(() => {
        const start = (page - 1) * pageSize;
        return attendanceList.slice(start, start + pageSize);
    }, [attendanceList, page, pageSize]);

    const totalHoursAll = useMemo(
        () => attendanceSummary.reduce((sum, s) => sum + s.totalHours, 0),
        [attendanceSummary]
    );

    const getStaffName = (uid: string) => staffList.find(s => s.uid === uid)?.fullName || uid;

    const handleEditSubmit = async (data: { checkIn?: string | null; checkOut?: string | null; note?: string }) => {
        if (!editTarget) return;
        setActionLoading(true);
        try {
            await dispatch(updateAttendance({ id: editTarget.id, data })).unwrap();
            showToast('ok', 'Cập nhật chấm công thành công');
            setEditTarget(null);
        } catch (e: any) {
            showToast('err', e || 'Cập nhật thất bại');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setActionLoading(true);
        try {
            await dispatch(deleteAttendance(deleteTarget.id)).unwrap();
            showToast('ok', 'Đã xóa bản ghi chấm công');
            setDeleteTarget(null);
        } catch (e: any) {
            showToast('err', e || 'Xóa thất bại');
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div className="admin-layout">
            <AdminSidebar />
            <div className="admin-layout__main">
                <AppBar variant="app" title="Chấm công" subtitle="Xem và chỉnh sửa dữ liệu chấm công của nhân viên" />

                <div className="emp-page">
                    {toast && <div className={`sm-toast sm-toast--${toast.type}`}>{toast.msg}</div>}

                    {/* Toolbar lọc */}
                    <div className="emp-toolbar">
                        <div className="emp-toolbar__filters">
                            <select
                                className="sm-field__input sm-field__input--select"
                                value={filterStaffUid}
                                onChange={e => setFilterStaffUid(e.target.value)}
                            >
                                <option value="">Tất cả nhân viên</option>
                                {staffList.map(s => (
                                    <option key={s.uid} value={s.uid}>{s.fullName}</option>
                                ))}
                            </select>
                            <input
                                type="date"
                                className="sm-field__input"
                                value={from}
                                onChange={e => setFrom(e.target.value)}
                            />
                            <span className="emp-toolbar__sep">→</span>
                            <input
                                type="date"
                                className="sm-field__input"
                                value={to}
                                onChange={e => setTo(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Tổng hợp */}
                    <div className="emp-summary-cards">
                        <div className="emp-summary-card">
                            <span className="emp-summary-card__label">Tổng số bản ghi</span>
                            <span className="emp-summary-card__value">{attendanceList.length}</span>
                        </div>
                        <div className="emp-summary-card">
                            <span className="emp-summary-card__label">Tổng giờ công</span>
                            <span className="emp-summary-card__value">{totalHoursAll.toFixed(2)}h</span>
                        </div>
                        <div className="emp-summary-card">
                            <span className="emp-summary-card__label">Số nhân viên có công</span>
                            <span className="emp-summary-card__value">{attendanceSummary.length}</span>
                        </div>
                    </div>

                    {/* Bảng tổng hợp theo nhân viên */}
                    {attendanceSummary.length > 0 && (
                        <div className="sm-table-wrap emp-summary-table">
                            <table className="sm-table">
                                <thead>
                                <tr>
                                    <th>Nhân viên</th>
                                    <th>Số ngày công</th>
                                    <th>Tổng giờ</th>
                                </tr>
                                </thead>
                                <tbody>
                                {attendanceSummary.map(s => (
                                    <tr key={s.staffUid}>
                                        <td>{getStaffName(s.staffUid)}</td>
                                        <td className="sm-table__mono">{s.days}</td>
                                        <td className="sm-table__mono">{s.totalHours.toFixed(2)}h</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Bảng chi tiết */}
                    {attendanceLoading ? (
                        <div className="sm-loading">Đang tải dữ liệu chấm công...</div>
                    ) : attendanceError ? (
                        <div className="sm-error">{attendanceError}</div>
                    ) : (
                        <>
                            <AttendanceTable
                                records={pagedList}
                                staffList={staffList}
                                onEdit={r => setEditTarget(r)}
                                onDelete={r => setDeleteTarget(r)}
                            />
                            <Pagination
                                page={page}
                                pageSize={pageSize}
                                total={attendanceList.length}
                                onPageChange={p => dispatch(setAttendancePage(p))}
                                onPageSizeChange={sz => dispatch(setAttendancePageSize(sz))}
                            />
                        </>
                    )}
                </div>
            </div>

            {/* Edit modal */}
            {editTarget && (
                <AttendanceEditModal
                    record={editTarget}
                    staffName={getStaffName(editTarget.staffUid)}
                    loading={actionLoading}
                    onSubmit={handleEditSubmit}
                    onClose={() => setEditTarget(null)}
                />
            )}

            {/* Delete confirm */}
            {deleteTarget && (
                <div className="sm-modal__backdrop" onClick={() => setDeleteTarget(null)}>
                    <div className="sm-modal__box sm-modal__box--sm" onClick={e => e.stopPropagation()}>
                        <div className="sm-modal__header">
                            <h2 className="sm-modal__title">Xác nhận xóa bản ghi</h2>
                            <button className="sm-modal__close" onClick={() => setDeleteTarget(null)}>✕</button>
                        </div>
                        <div className="sm-modal__body">
                            <p className="sm-modal__desc">
                                Xóa bản ghi chấm công ngày <strong>{deleteTarget.date}</strong> của{' '}
                                <strong>{getStaffName(deleteTarget.staffUid)}</strong>? Hành động này không thể hoàn tác.
                            </p>
                        </div>
                        <div className="sm-modal__footer">
                            <button className="sm-btn sm-btn--ghost" onClick={() => setDeleteTarget(null)}>Hủy</button>
                            <button className="sm-btn sm-btn--danger" onClick={handleDelete} disabled={actionLoading}>
                                {actionLoading ? 'Đang xóa...' : 'Xóa bản ghi'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminAttendancePage;