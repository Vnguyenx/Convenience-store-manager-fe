// src/pages/admin/AdminEmployeesPage.tsx
import React, { useEffect, useState, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
    fetchAllStaff, createStaff, updateStaff, deleteStaff, resetStaffPassword,
} from '../../store/staffSlice';
import { Staff } from '../../types/staff';
import AppBar from '../../components/layout/AppBar';
import AdminSidebar from '../../components/layout/AdminSidebar';
import StaffTable from '../../components/employees/StaffTable';
import StaffFormModal from '../../components/employees/StaffFormModal';
import ResetPasswordModal from '../../components/employees/ResetPasswordModal';
import Pagination from '../../components/employees/Pagination';
import '../../styles/admin/adminEmployees.css';

type FilterRole = 'all' | 'admin' | 'staff';
type FilterActive = 'all' | 'true' | 'false';

const AdminEmployeesPage: React.FC = () => {
    const dispatch = useAppDispatch();
    const { staffList, staffLoading, staffError } = useAppSelector(s => s.staff);

    // Filters
    const [filterRole, setFilterRole] = useState<FilterRole>('all');
    const [filterActive, setFilterActive] = useState<FilterActive>('all');
    const [search, setSearch] = useState('');

    // Pagination (client-side, vì staffList tải toàn bộ về 1 lần)
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    // Modals
    const [formModal, setFormModal] = useState<{ open: boolean; mode: 'create' | 'edit'; target: Staff | null }>({ open: false, mode: 'create', target: null });
    const [resetModal, setResetModal] = useState<{ open: boolean; target: Staff | null }>({ open: false, target: null });
    const [deleteTarget, setDeleteTarget] = useState<Staff | null>(null);

    // Action loading states
    const [actionLoading, setActionLoading] = useState(false);
    const [toast, setToast] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null);

    // ── Load ──────────────────────────────────────────────────────────────────
    useEffect(() => {
        dispatch(fetchAllStaff({}));
    }, []);

    const showToast = (type: 'ok' | 'err', msg: string) => {
        setToast({ type, msg });
        setTimeout(() => setToast(null), 3200);
    };

    // ── Filtered list ─────────────────────────────────────────────────────────
    const filtered = useMemo(() => staffList.filter(s => {
        if (filterRole !== 'all' && s.role !== filterRole) return false;
        if (filterActive !== 'all' && String(s.isActive) !== filterActive) return false;
        if (search) {
            const q = search.toLowerCase();
            if (!s.fullName.toLowerCase().includes(q) && !s.email.toLowerCase().includes(q) && !(s.phone || '').includes(q)) return false;
        }
        return true;
    }), [staffList, filterRole, filterActive, search]);

    // Reset về trang 1 mỗi khi bộ lọc thay đổi
    useEffect(() => { setPage(1); }, [filterRole, filterActive, search]);

    const pagedList = useMemo(() => {
        const start = (page - 1) * pageSize;
        return filtered.slice(start, start + pageSize);
    }, [filtered, page, pageSize]);

    // ── Handlers ──────────────────────────────────────────────────────────────
    const handleCreate = async (data: any) => {
        setActionLoading(true);
        try {
            await dispatch(createStaff(data)).unwrap();
            showToast('ok', 'Tạo nhân viên thành công');
            setFormModal({ open: false, mode: 'create', target: null });
            dispatch(fetchAllStaff({}));
        } catch (e: any) {
            showToast('err', e || 'Tạo nhân viên thất bại');
        } finally {
            setActionLoading(false);
        }
    };

    const handleUpdate = async (data: any) => {
        if (!formModal.target) return;
        setActionLoading(true);
        try {
            await dispatch(updateStaff({ uid: formModal.target.uid, data })).unwrap();
            showToast('ok', 'Cập nhật thành công');
            setFormModal({ open: false, mode: 'edit', target: null });
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
            await dispatch(deleteStaff({ uid: deleteTarget.uid })).unwrap();
            showToast('ok', `Đã vô hiệu hóa ${deleteTarget.fullName}`);
            setDeleteTarget(null);
        } catch (e: any) {
            showToast('err', e || 'Thao tác thất bại');
        } finally {
            setActionLoading(false);
        }
    };

    const handleResetPassword = async (newPassword: string) => {
        if (!resetModal.target) return;
        setActionLoading(true);
        try {
            await dispatch(resetStaffPassword({ uid: resetModal.target.uid, newPassword })).unwrap();
            showToast('ok', 'Đặt lại mật khẩu thành công');
            setResetModal({ open: false, target: null });
        } catch (e: any) {
            showToast('err', e || 'Reset mật khẩu thất bại');
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div className="admin-layout">
            <AdminSidebar />
            <div className="admin-layout__main">
                <AppBar variant="app" title="Quản lý nhân viên" subtitle="Thêm, sửa, phân quyền nhân viên" />

                <div className="emp-page">
                    {toast && <div className={`sm-toast sm-toast--${toast.type}`}>{toast.msg}</div>}

                    {/* Toolbar */}
                    <div className="emp-toolbar">
                        <div className="emp-toolbar__filters">
                            <input
                                className="sm-field__input emp-search"
                                placeholder="Tìm tên, email, SĐT..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                            <select
                                className="sm-field__input sm-field__input--select"
                                value={filterRole}
                                onChange={e => setFilterRole(e.target.value as FilterRole)}
                            >
                                <option value="all">Tất cả vai trò</option>
                                <option value="admin">Quản lý</option>
                                <option value="staff">Thu ngân</option>
                            </select>
                            <select
                                className="sm-field__input sm-field__input--select"
                                value={filterActive}
                                onChange={e => setFilterActive(e.target.value as FilterActive)}
                            >
                                <option value="all">Tất cả trạng thái</option>
                                <option value="true">Đang hoạt động</option>
                                <option value="false">Vô hiệu hóa</option>
                            </select>
                        </div>
                        <button
                            className="sm-btn sm-btn--primary"
                            onClick={() => setFormModal({ open: true, mode: 'create', target: null })}
                        >
                            + Thêm nhân viên
                        </button>
                    </div>

                    {/* Summary */}
                    <div className="emp-summary">
                        <span className="emp-summary__total">Hiển thị <strong>{filtered.length}</strong> / {staffList.length} nhân viên</span>
                    </div>

                    {/* Table */}
                    {staffLoading ? (
                        <div className="sm-loading">Đang tải danh sách nhân viên...</div>
                    ) : staffError ? (
                        <div className="sm-error">{staffError}</div>
                    ) : (
                        <>
                            <StaffTable
                                staff={pagedList}
                                onEdit={s => setFormModal({ open: true, mode: 'edit', target: s })}
                                onDelete={s => setDeleteTarget(s)}
                                onResetPassword={s => setResetModal({ open: true, target: s })}
                            />
                            <Pagination
                                page={page}
                                pageSize={pageSize}
                                total={filtered.length}
                                onPageChange={setPage}
                                onPageSizeChange={sz => { setPageSize(sz); setPage(1); }}
                            />
                        </>
                    )}
                </div>
            </div>

            {/* Form modal */}
            {formModal.open && (
                <StaffFormModal
                    mode={formModal.mode}
                    initial={formModal.target}
                    loading={actionLoading}
                    onSubmit={formModal.mode === 'create' ? handleCreate : handleUpdate}
                    onClose={() => setFormModal({ open: false, mode: 'create', target: null })}
                />
            )}

            {/* Reset password modal */}
            {resetModal.open && resetModal.target && (
                <ResetPasswordModal
                    staffName={resetModal.target.fullName}
                    loading={actionLoading}
                    onSubmit={handleResetPassword}
                    onClose={() => setResetModal({ open: false, target: null })}
                />
            )}

            {/* Delete confirm */}
            {deleteTarget && (
                <div className="sm-modal__backdrop" onClick={() => setDeleteTarget(null)}>
                    <div className="sm-modal__box sm-modal__box--sm" onClick={e => e.stopPropagation()}>
                        <div className="sm-modal__header">
                            <h2 className="sm-modal__title">Xác nhận vô hiệu hóa</h2>
                            <button className="sm-modal__close" onClick={() => setDeleteTarget(null)}>✕</button>
                        </div>
                        <div className="sm-modal__body">
                            <p className="sm-modal__desc">
                                Vô hiệu hóa <strong>{deleteTarget.fullName}</strong>?
                                Nhân viên sẽ không thể đăng nhập nhưng dữ liệu vẫn được giữ lại.
                            </p>
                        </div>
                        <div className="sm-modal__footer">
                            <button className="sm-btn sm-btn--ghost" onClick={() => setDeleteTarget(null)}>Hủy</button>
                            <button className="sm-btn sm-btn--danger" onClick={handleDelete} disabled={actionLoading}>
                                {actionLoading ? 'Đang xử lý...' : 'Vô hiệu hóa'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminEmployeesPage;