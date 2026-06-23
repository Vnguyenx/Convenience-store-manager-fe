// src/components/employees/AssignmentPanel.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
    fetchAssignments, createAssignment, deleteAssignment,
    setAssignmentPage, setAssignmentPageSize,
} from '../../store/staffSlice';
import { ShiftAssignment, Shift, Staff, AssignmentStatus } from '../../types/staff';
import Pagination from './Pagination';

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

function todayStr() {
    return new Date().toISOString().split('T')[0];
}

interface Props {
    shifts: Shift[];
    staffList: Staff[];
}

const statusLabel: Record<string, string> = {
    scheduled: 'Lịch',
    completed: 'Hoàn thành',
    absent: 'Vắng',
};
const statusClass: Record<string, string> = {
    scheduled: 'sm-status--scheduled',
    completed: 'sm-status--active',
    absent: 'sm-status--inactive',
};

const AssignmentPanel: React.FC<Props> = ({ shifts, staffList }) => {
    const dispatch = useAppDispatch();
    const { assignmentList, assignmentLoading, assignmentError, assignmentPagination } = useAppSelector(s => s.staff);

    const [filterDate, setFilterDate] = useState(todayStr());
    const [filterStaffUid, setFilterStaffUid] = useState('');
    const [filterShiftId, setFilterShiftId] = useState('');
    const [filterStatus, setFilterStatus] = useState<AssignmentStatus | ''>('');

    const [form, setForm] = useState({ shiftId: '', staffUid: '', date: todayStr() });
    const [formErrors, setFormErrors] = useState<{ shiftId?: string; staffUid?: string; date?: string }>({});
    const [submitting, setSubmitting] = useState(false);
    const [toast, setToast] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null);

    // Tải lại khi đổi bộ lọc server-side (chỉ date + staffUid + shiftId được gửi lên server)
    useEffect(() => {
        dispatch(fetchAssignments({
            date: filterDate || undefined,
            staffUid: filterStaffUid || undefined,
            shiftId: filterShiftId || undefined,
        }));
    }, [filterDate, filterStaffUid, filterShiftId]);

    const showToast = (type: 'ok' | 'err', msg: string) => {
        setToast({ type, msg });
        setTimeout(() => setToast(null), 3000);
    };

    const validateForm = () => {
        const errs: typeof formErrors = {};
        if (!form.shiftId) errs.shiftId = 'Chọn ca làm việc';
        if (!form.staffUid) errs.staffUid = 'Chọn nhân viên';
        if (!form.date || !DATE_REGEX.test(form.date)) errs.date = 'Ngày không hợp lệ';
        return errs;
    };

    const handleAssign = async () => {
        const errs = validateForm();
        setFormErrors(errs);
        if (Object.keys(errs).length > 0) return;

        setSubmitting(true);
        try {
            await dispatch(createAssignment(form)).unwrap();
            showToast('ok', 'Phân ca thành công');
            setForm(f => ({ ...f, shiftId: '', staffUid: '' }));
            dispatch(fetchAssignments({ date: filterDate || undefined, staffUid: filterStaffUid || undefined, shiftId: filterShiftId || undefined }));
        } catch (e: any) {
            showToast('err', e || 'Phân ca thất bại');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Xóa phân ca này?')) return;
        try {
            await dispatch(deleteAssignment(id)).unwrap();
            showToast('ok', 'Đã xóa phân ca');
        } catch (e: any) {
            showToast('err', e || 'Không thể xóa');
        }
    };

    const getShiftName = (id: string) => shifts.find(s => s.id === id)?.title || id;
    const getStaffName = (uid: string) => staffList.find(s => s.uid === uid)?.fullName || uid;

    const activeStaff = staffList.filter(s => s.isActive);
    const activeShifts = shifts.filter(s => s.isActive);

    // Lọc theo trạng thái ở client (vì backend chưa hỗ trợ filter status)
    const filteredList = useMemo(
        () => filterStatus ? assignmentList.filter(a => a.status === filterStatus) : assignmentList,
        [assignmentList, filterStatus]
    );

    // Phân trang ở client
    const { page, pageSize } = assignmentPagination;
    const pagedList = useMemo(() => {
        const start = (page - 1) * pageSize;
        return filteredList.slice(start, start + pageSize);
    }, [filteredList, page, pageSize]);

    const resetFilters = () => {
        setFilterDate('');
        setFilterStaffUid('');
        setFilterShiftId('');
        setFilterStatus('');
    };

    return (
        <div className="sm-assign">
            {toast && (
                <div className={`sm-toast sm-toast--${toast.type}`}>{toast.msg}</div>
            )}

            {/* Form phân ca */}
            <div className="sm-assign__form">
                <h3 className="sm-assign__form-title">Phân ca mới</h3>
                <div className="sm-assign__form-grid">
                    <div className="sm-field">
                        <label className="sm-field__label">Ca làm việc <span className="sm-field__req">*</span></label>
                        <select
                            className={`sm-field__input sm-field__input--select ${formErrors.shiftId ? 'sm-field__input--err' : ''}`}
                            value={form.shiftId}
                            onChange={e => { setForm(f => ({ ...f, shiftId: e.target.value })); setFormErrors(p => ({ ...p, shiftId: undefined })); }}
                        >
                            <option value="">-- Chọn ca --</option>
                            {activeShifts.map(sh => (
                                <option key={sh.id} value={sh.id}>
                                    {sh.title} ({sh.startTime}–{sh.endTime})
                                </option>
                            ))}
                        </select>
                        {formErrors.shiftId && <span className="sm-field__error">{formErrors.shiftId}</span>}
                    </div>

                    <div className="sm-field">
                        <label className="sm-field__label">Nhân viên <span className="sm-field__req">*</span></label>
                        <select
                            className={`sm-field__input sm-field__input--select ${formErrors.staffUid ? 'sm-field__input--err' : ''}`}
                            value={form.staffUid}
                            onChange={e => { setForm(f => ({ ...f, staffUid: e.target.value })); setFormErrors(p => ({ ...p, staffUid: undefined })); }}
                        >
                            <option value="">-- Chọn nhân viên --</option>
                            {activeStaff.map(s => (
                                <option key={s.uid} value={s.uid}>{s.fullName}</option>
                            ))}
                        </select>
                        {formErrors.staffUid && <span className="sm-field__error">{formErrors.staffUid}</span>}
                    </div>

                    <div className="sm-field">
                        <label className="sm-field__label">Ngày <span className="sm-field__req">*</span></label>
                        <input
                            type="date"
                            className={`sm-field__input ${formErrors.date ? 'sm-field__input--err' : ''}`}
                            value={form.date}
                            onChange={e => { setForm(f => ({ ...f, date: e.target.value })); setFormErrors(p => ({ ...p, date: undefined })); }}
                        />
                        {formErrors.date && <span className="sm-field__error">{formErrors.date}</span>}
                    </div>

                    <div className="sm-assign__form-action">
                        <button className="sm-btn sm-btn--primary" onClick={handleAssign} disabled={submitting}>
                            {submitting ? 'Đang phân...' : '+ Phân ca'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Bộ lọc xem */}
            <div className="sm-assign__filter sm-assign__filter--grid">
                <div className="sm-field">
                    <label className="sm-field__label">Ngày</label>
                    <input
                        type="date"
                        className="sm-field__input"
                        value={filterDate}
                        onChange={e => setFilterDate(e.target.value)}
                    />
                </div>

                <div className="sm-field">
                    <label className="sm-field__label">Nhân viên</label>
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
                </div>

                <div className="sm-field">
                    <label className="sm-field__label">Ca làm việc</label>
                    <select
                        className="sm-field__input sm-field__input--select"
                        value={filterShiftId}
                        onChange={e => setFilterShiftId(e.target.value)}
                    >
                        <option value="">Tất cả ca</option>
                        {shifts.map(sh => (
                            <option key={sh.id} value={sh.id}>{sh.title}</option>
                        ))}
                    </select>
                </div>

                <div className="sm-field">
                    <label className="sm-field__label">Trạng thái</label>
                    <select
                        className="sm-field__input sm-field__input--select"
                        value={filterStatus}
                        onChange={e => setFilterStatus(e.target.value as AssignmentStatus | '')}
                    >
                        <option value="">Tất cả trạng thái</option>
                        <option value="scheduled">Lịch</option>
                        <option value="completed">Hoàn thành</option>
                        <option value="absent">Vắng</option>
                    </select>
                </div>

                <div className="sm-assign__filter-action">
                    <button className="sm-btn sm-btn--ghost" onClick={resetFilters}>Xóa lọc</button>
                </div>
            </div>

            {/* Danh sách assignment */}
            {assignmentLoading ? (
                <div className="sm-loading">Đang tải...</div>
            ) : assignmentError ? (
                <div className="sm-error">{assignmentError}</div>
            ) : filteredList.length === 0 ? (
                <div className="sm-empty">
                    <svg viewBox="0 0 24 24" width="36" height="36"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                    <p>Không có phân ca nào khớp với bộ lọc</p>
                </div>
            ) : (
                <>
                    <div className="sm-table-wrap">
                        <table className="sm-table">
                            <thead>
                            <tr>
                                <th>Nhân viên</th>
                                <th>Ca làm việc</th>
                                <th>Ngày</th>
                                <th>Trạng thái</th>
                                <th>Thao tác</th>
                            </tr>
                            </thead>
                            <tbody>
                            {pagedList.map(a => (
                                <tr key={a.id}>
                                    <td>{getStaffName(a.staffUid)}</td>
                                    <td>{getShiftName(a.shiftId)}</td>
                                    <td className="sm-table__mono">{a.date}</td>
                                    <td>
                                            <span className={`sm-status ${statusClass[a.status] || ''}`}>
                                                {statusLabel[a.status] || a.status}
                                            </span>
                                    </td>
                                    <td>
                                        <button
                                            className="sm-action-btn sm-action-btn--del"
                                            onClick={() => handleDelete(a.id)}
                                            disabled={a.status !== 'scheduled'}
                                            title={a.status !== 'scheduled' ? 'Chỉ xóa được ca ở trạng thái "Lịch"' : 'Xóa phân ca'}
                                        >
                                            <svg viewBox="0 0 24 24" width="15" height="15"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>

                    <Pagination
                        page={page}
                        pageSize={pageSize}
                        total={filteredList.length}
                        onPageChange={p => dispatch(setAssignmentPage(p))}
                        onPageSizeChange={sz => dispatch(setAssignmentPageSize(sz))}
                    />
                </>
            )}
        </div>
    );
};

export default AssignmentPanel;
