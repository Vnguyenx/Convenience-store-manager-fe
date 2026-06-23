// src/pages/admin/AdminPayrollPage.tsx
import React, { useEffect, useState, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
    fetchAllStaff, fetchPayrolls, fetchPayrollConfigs, calculatePayroll,
    updatePayroll, setPayrollConfig,
    setPayrollPage, setPayrollPageSize,
} from '../../store/staffSlice';
import { PayrollStatus } from '../../types/staff';
import AppBar from '../../components/layout/AppBar';
import AdminSidebar from '../../components/layout/AdminSidebar';
import PayrollTable from '../../../src/components/employees/PayrollTable';
import PayrollConfigModal from '../../../src/components/employees/PayrollConfigModal';
import Pagination from '../../../src/components/employees/Pagination';
import '../../styles/admin/adminEmployees.css';

function currentMonthStr() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

// input[type=month] không được hỗ trợ đầy đủ trên mọi browser (VD: Firefox rớt về
// text input tự do, không validate format) → dùng 2 select Năm/Tháng để luôn ra
// đúng "YYYY-MM" gửi lên backend, không phụ thuộc browser.
const MONTH_OPTIONS = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
function yearOptions() {
    const current = new Date().getFullYear();
    // 2 năm trước → 1 năm sau hiện tại, đủ dùng cho tính lương
    return Array.from({ length: 4 }, (_, i) => current - 2 + i);
}

const AdminPayrollPage: React.FC = () => {
    const dispatch = useAppDispatch();
    const {
        payrollList, payrollLoading, payrollError, payrollPagination,
        payrollConfigs, staffList,
    } = useAppSelector(s => s.staff);

    const [month, setMonth] = useState(currentMonthStr());
    const [year, monthNum] = month.split('-');

    const handleYearChange = (newYear: string) => setMonth(`${newYear}-${monthNum}`);
    const handleMonthChange = (newMonth: string) => setMonth(`${year}-${newMonth}`);

    const [filterStaffUid, setFilterStaffUid] = useState('');
    const [filterStatus, setFilterStatus] = useState<PayrollStatus | ''>('');

    const [calculating, setCalculating] = useState(false);
    const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
    const [configModalOpen, setConfigModalOpen] = useState(false);
    const [configLoading, setConfigLoading] = useState(false);
    const [toast, setToast] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null);

    useEffect(() => {
        dispatch(fetchAllStaff({}));
        dispatch(fetchPayrollConfigs());
    }, []);

    useEffect(() => {
        dispatch(fetchPayrolls({
            month: month || undefined,
            staffUid: filterStaffUid || undefined,
            status: filterStatus || undefined,
        }));
    }, [month, filterStaffUid, filterStatus]);

    const showToast = (type: 'ok' | 'err', msg: string) => {
        setToast({ type, msg });
        setTimeout(() => setToast(null), 3200);
    };

    const { page, pageSize } = payrollPagination;
    const pagedList = useMemo(() => {
        const start = (page - 1) * pageSize;
        return payrollList.slice(start, start + pageSize);
    }, [payrollList, page, pageSize]);

    const totals = useMemo(() => ({
        totalHours: payrollList.reduce((s, p) => s + p.totalHours, 0),
        totalFinal: payrollList.reduce((s, p) => s + p.finalSalary, 0),
    }), [payrollList]);

    const handleCalculate = async () => {
        setCalculating(true);
        try {
            const res = await dispatch(calculatePayroll({ month, staffUid: filterStaffUid || undefined })).unwrap();
            showToast('ok', `Đã tính lương tháng ${month} cho ${res.payrolls.length} nhân viên`);
            dispatch(fetchPayrolls({ month, staffUid: filterStaffUid || undefined, status: filterStatus || undefined }));
        } catch (e: any) {
            showToast('err', e || 'Tính lương thất bại');
        } finally {
            setCalculating(false);
        }
    };

    const handleUpdate = async (id: string, data: { bonus?: number; deduction?: number; status?: PayrollStatus; note?: string }) => {
        setActionLoadingId(id);
        try {
            await dispatch(updatePayroll({ id, data })).unwrap();
            showToast('ok', 'Cập nhật bảng lương thành công');
        } catch (e: any) {
            showToast('err', e || 'Cập nhật thất bại');
        } finally {
            setActionLoadingId(null);
        }
    };

    const handleConfigSubmit = async (staffUidOrDefault: string, hourlyRate: number) => {
        setConfigLoading(true);
        try {
            await dispatch(setPayrollConfig({ staffUidOrDefault, hourlyRate })).unwrap();
            showToast('ok', 'Cập nhật cấu hình lương thành công');
            setConfigModalOpen(false);
        } catch (e: any) {
            showToast('err', e || 'Cập nhật cấu hình thất bại');
        } finally {
            setConfigLoading(false);
        }
    };

    return (
        <div className="admin-layout">
            <AdminSidebar />
            <div className="admin-layout__main">
                <AppBar variant="app" title="Tính lương" subtitle="Tính và quản lý bảng lương nhân viên theo tháng" />

                <div className="emp-page">
                    {toast && <div className={`sm-toast sm-toast--${toast.type}`}>{toast.msg}</div>}

                    {/* Toolbar */}
                    <div className="emp-toolbar">
                        <div className="emp-toolbar__filters">
                            <select
                                className="sm-field__input sm-field__input--select emp-month-select"
                                value={monthNum}
                                onChange={e => handleMonthChange(e.target.value)}
                                aria-label="Tháng"
                            >
                                {MONTH_OPTIONS.map(m => (
                                    <option key={m} value={m}>Tháng {Number(m)}</option>
                                ))}
                            </select>
                            <select
                                className="sm-field__input sm-field__input--select emp-month-select"
                                value={year}
                                onChange={e => handleYearChange(e.target.value)}
                                aria-label="Năm"
                            >
                                {yearOptions().map(y => (
                                    <option key={y} value={y}>{y}</option>
                                ))}
                            </select>
                            <select
                                className="sm-field__input sm-field__input--select"
                                value={filterStaffUid}
                                onChange={e => setFilterStaffUid(e.target.value)}
                            >
                                <option value="">Tất cả nhân viên</option>
                                {staffList.filter(s => s.role === 'staff').map(s => (
                                    <option key={s.uid} value={s.uid}>{s.fullName}</option>
                                ))}
                            </select>
                            <select
                                className="sm-field__input sm-field__input--select"
                                value={filterStatus}
                                onChange={e => setFilterStatus(e.target.value as PayrollStatus | '')}
                            >
                                <option value="">Tất cả trạng thái</option>
                                <option value="draft">Nháp</option>
                                <option value="confirmed">Đã xác nhận</option>
                                <option value="paid">Đã thanh toán</option>
                            </select>
                        </div>
                        <div className="emp-toolbar__actions">
                            <button className="sm-btn sm-btn--ghost" onClick={() => setConfigModalOpen(true)}>
                                ⚙ Cấu hình lương/giờ
                            </button>
                            <button className="sm-btn sm-btn--primary" onClick={handleCalculate} disabled={calculating}>
                                {calculating ? 'Đang tính...' : `Tính lương tháng ${month}`}
                            </button>
                        </div>
                    </div>

                    {/* Tổng hợp */}
                    <div className="emp-summary-cards">
                        <div className="emp-summary-card">
                            <span className="emp-summary-card__label">Số bảng lương</span>
                            <span className="emp-summary-card__value">{payrollList.length}</span>
                        </div>
                        <div className="emp-summary-card">
                            <span className="emp-summary-card__label">Tổng giờ công</span>
                            <span className="emp-summary-card__value">{totals.totalHours.toFixed(2)}h</span>
                        </div>
                        <div className="emp-summary-card">
                            <span className="emp-summary-card__label">Tổng thực lĩnh</span>
                            <span className="emp-summary-card__value">{totals.totalFinal.toLocaleString('vi-VN')}đ</span>
                        </div>
                    </div>

                    {/* Bảng lương */}
                    {payrollLoading ? (
                        <div className="sm-loading">Đang tải bảng lương...</div>
                    ) : payrollError ? (
                        <div className="sm-error">{payrollError}</div>
                    ) : (
                        <>
                            <PayrollTable
                                payrolls={pagedList}
                                staffList={staffList}
                                actionLoadingId={actionLoadingId}
                                onUpdate={handleUpdate}
                            />
                            <Pagination
                                page={page}
                                pageSize={pageSize}
                                total={payrollList.length}
                                onPageChange={p => dispatch(setPayrollPage(p))}
                                onPageSizeChange={sz => dispatch(setPayrollPageSize(sz))}
                            />
                        </>
                    )}
                </div>
            </div>

            {configModalOpen && (
                <PayrollConfigModal
                    configs={payrollConfigs}
                    staffList={staffList}
                    loading={configLoading}
                    onSubmit={handleConfigSubmit}
                    onClose={() => setConfigModalOpen(false)}
                />
            )}
        </div>
    );
};

export default AdminPayrollPage;