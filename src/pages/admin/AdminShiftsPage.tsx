// src/pages/admin/AdminShiftsPage.tsx
import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
    fetchAllShifts, fetchAllStaff,
    createShift, updateShift, deleteShift,
} from '../../store/staffSlice';
import { Shift } from '../../types/staff';
import AppBar from '../../components/layout/AppBar';
import AdminSidebar from '../../components/layout/AdminSidebar';
import ShiftFormModal from '../../components/employees/ShiftFormModal';
import AssignmentPanel from '../../components/employees/AssignmentPanel';
import '../../styles/admin/adminEmployees.css';

const AdminShiftsPage: React.FC = () => {
    const dispatch = useAppDispatch();
    const { shiftList, shiftLoading, shiftError, staffList } = useAppSelector(s => s.staff);

    const [tab, setTab] = useState<'shifts' | 'assignments'>('shifts');
    const [formModal, setFormModal] = useState<{ open: boolean; mode: 'create' | 'edit'; target: Shift | null }>
    ({ open: false, mode: 'create', target: null });
    const [deleteTarget, setDeleteTarget] = useState<Shift | null>(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [toast, setToast] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null);

    useEffect(() => {
        dispatch(fetchAllShifts());
        dispatch(fetchAllStaff({}));
    }, []);

    const showToast = (type: 'ok' | 'err', msg: string) => {
        setToast({ type, msg });
        setTimeout(() => setToast(null), 3000);
    };

    const handleCreate = async (data: any) => {
        setActionLoading(true);
        try {
            await dispatch(createShift(data)).unwrap();
            showToast('ok', 'Tạo ca thành công');
            setFormModal({ open: false, mode: 'create', target: null });
        } catch (e: any) {
            showToast('err', e || 'Tạo ca thất bại');
        } finally { setActionLoading(false); }
    };

    const handleUpdate = async (data: any) => {
        if (!formModal.target) return;
        setActionLoading(true);
        try {
            await dispatch(updateShift({ id: formModal.target.id, data })).unwrap();
            showToast('ok', 'Cập nhật ca thành công');
            setFormModal({ open: false, mode: 'edit', target: null });
        } catch (e: any) {
            showToast('err', e || 'Cập nhật thất bại');
        } finally { setActionLoading(false); }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setActionLoading(true);
        try {
            await dispatch(deleteShift(deleteTarget.id)).unwrap();
            showToast('ok', `Đã xóa ca "${deleteTarget.title}"`);
            setDeleteTarget(null);
        } catch (e: any) {
            showToast('err', e || 'Không thể xóa ca');
        } finally { setActionLoading(false); }
    };

    /** Tính thời lượng ca từ startTime và endTime dạng "HH:mm" */
    function calcDuration(startTime: string, endTime: string) {
        const [sh, sm] = startTime.split(':').map(Number);
        const [eh, em] = endTime.split(':').map(Number);
        const mins = (eh * 60 + em) - (sh * 60 + sm);
        if (mins <= 0) return '—';
        return `${Math.floor(mins / 60)}h${mins % 60 ? (mins % 60) + 'm' : ''}`;
    }

    return (
        <div className="admin-layout">
            <AdminSidebar />
            <div className="admin-layout__main">
                <AppBar variant="app" title="Ca làm việc" subtitle="Quản lý ca và phân công nhân viên" />

                <div className="emp-page">
                    {toast && <div className={`sm-toast sm-toast--${toast.type}`}>{toast.msg}</div>}

                    {/* Tabs */}
                    <div className="emp-tabs">
                        <button
                            className={`emp-tab ${tab === 'shifts' ? 'emp-tab--active' : ''}`}
                            onClick={() => setTab('shifts')}
                        >
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                            </svg>
                            Danh sách ca
                        </button>
                        <button
                            className={`emp-tab ${tab === 'assignments' ? 'emp-tab--active' : ''}`}
                            onClick={() => setTab('assignments')}
                        >
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="4" width="18" height="18" rx="2"/>
                                <line x1="16" y1="2" x2="16" y2="6"/>
                                <line x1="8" y1="2" x2="8" y2="6"/>
                                <line x1="3" y1="10" x2="21" y2="10"/>
                            </svg>
                            Phân ca
                        </button>
                    </div>

                    {/* Tab: Shifts */}
                    {tab === 'shifts' && (
                        <>
                            <div className="emp-toolbar">
                                <div className="emp-toolbar__filters" />
                                <button
                                    className="sm-btn sm-btn--primary"
                                    onClick={() => setFormModal({ open: true, mode: 'create', target: null })}
                                >
                                    + Thêm ca
                                </button>
                            </div>

                            {shiftLoading ? (
                                <div className="sm-loading">Đang tải...</div>
                            ) : shiftError ? (
                                <div className="sm-error">{shiftError}</div>
                            ) : shiftList.length === 0 ? (
                                <div className="sm-empty">
                                    <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.5">
                                        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                                    </svg>
                                    <p>Chưa có ca làm việc nào. Nhấn "+ Thêm ca" để tạo mới.</p>
                                </div>
                            ) : (
                                <div className="sm-table-wrap">
                                    <table className="sm-table">
                                        <thead>
                                        <tr>
                                            <th>Tên ca</th>
                                            <th>Giờ bắt đầu</th>
                                            <th>Giờ kết thúc</th>
                                            <th>Thời lượng</th>
                                            <th>Trạng thái</th>
                                            <th>Thao tác</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {shiftList.map(shift => (
                                            <tr key={shift.id} className={!shift.isActive ? 'sm-table__row--inactive' : ''}>
                                                <td><strong>{shift.title}</strong></td>
                                                <td className="sm-table__mono">{shift.startTime}</td>
                                                <td className="sm-table__mono">{shift.endTime}</td>
                                                <td className="sm-table__mono">{calcDuration(shift.startTime, shift.endTime)}</td>
                                                <td>
                                                    {shift.isActive
                                                        ? <span className="sm-status sm-status--active">Đang dùng</span>
                                                        : <span className="sm-status sm-status--inactive">Ngừng dùng</span>
                                                    }
                                                </td>
                                                <td>
                                                    <div className="sm-actions">
                                                        <button
                                                            className="sm-action-btn sm-action-btn--edit"
                                                            onClick={() => setFormModal({ open: true, mode: 'edit', target: shift })}
                                                            title="Chỉnh sửa"
                                                        >
                                                            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                                            </svg>
                                                        </button>
                                                        <button
                                                            className="sm-action-btn sm-action-btn--del"
                                                            onClick={() => setDeleteTarget(shift)}
                                                            title="Xóa ca"
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
                            )}
                        </>
                    )}

                    {/* Tab: Assignments */}
                    {tab === 'assignments' && (
                        <AssignmentPanel shifts={shiftList} staffList={staffList} />
                    )}
                </div>
            </div>

            {/* Shift form modal */}
            {formModal.open && (
                <ShiftFormModal
                    mode={formModal.mode}
                    initial={formModal.target}
                    loading={actionLoading}
                    onSubmit={formModal.mode === 'create' ? handleCreate : handleUpdate}
                    onClose={() => setFormModal({ open: false, mode: 'create', target: null })}
                />
            )}

            {/* Delete confirm */}
            {deleteTarget && (
                <div className="sm-modal__backdrop" onClick={() => setDeleteTarget(null)}>
                    <div className="sm-modal__box sm-modal__box--sm" onClick={e => e.stopPropagation()}>
                        <div className="sm-modal__header">
                            <h2 className="sm-modal__title">Xác nhận xóa ca</h2>
                            <button className="sm-modal__close" onClick={() => setDeleteTarget(null)}>✕</button>
                        </div>
                        <div className="sm-modal__body">
                            <p className="sm-modal__desc">
                                Xóa ca <strong>"{deleteTarget.title}"</strong>?
                                Thao tác sẽ thất bại nếu ca còn phân công chưa hoàn thành.
                            </p>
                        </div>
                        <div className="sm-modal__footer">
                            <button className="sm-btn sm-btn--ghost" onClick={() => setDeleteTarget(null)}>Hủy</button>
                            <button className="sm-btn sm-btn--danger" onClick={handleDelete} disabled={actionLoading}>
                                {actionLoading ? 'Đang xóa...' : 'Xóa ca'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminShiftsPage;