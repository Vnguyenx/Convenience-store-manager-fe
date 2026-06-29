// src/components/employees/PayrollTable.tsx
import React, { useState } from 'react';
import { Payroll, Staff, PayrollStatus } from '../../types/staff';

interface Props {
    payrolls: Payroll[];
    staffList: Staff[];
    actionLoadingId: string | null;
    onUpdate: (id: string, data: { bonus?: number; deduction?: number; status?: PayrollStatus; note?: string }) => void;
}

const statusLabel: Record<PayrollStatus, string> = {
    draft: 'Nháp',
    confirmed: 'Đã xác nhận',
    paid: 'Đã thanh toán',
};
const statusClass: Record<PayrollStatus, string> = {
    draft: 'sm-status--inactive',
    confirmed: 'sm-status--scheduled',
    paid: 'sm-status--active',
};
const fmtMoney = (n: number) => n.toLocaleString('vi-VN') + 'đ';

const PayrollTable: React.FC<Props> = ({ payrolls, staffList, actionLoadingId, onUpdate }) => {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editBonus, setEditBonus] = useState('');
    const [editDeduction, setEditDeduction] = useState('');
    const [editNote, setEditNote] = useState('');
    const [editError, setEditError] = useState<string | null>(null);

    const getStaffName = (uid: string) => staffList.find(s => s.uid === uid)?.fullName || uid;

    const startEdit = (p: Payroll) => {
        setEditingId(p.id);
        setEditBonus(String(p.bonus));
        setEditDeduction(String(p.deduction));
        setEditNote(p.note || '');
        setEditError(null);
    };

    const saveEdit = (id: string) => {
        const bonus = Number(editBonus);
        const deduction = Number(editDeduction);

        if (editBonus.trim() === '' || isNaN(bonus) || bonus < 0) {
            setEditError('Thưởng phải là số không âm');
            return;
        }
        if (editDeduction.trim() === '' || isNaN(deduction) || deduction < 0) {
            setEditError('Khấu trừ phải là số không âm');
            return;
        }

        setEditError(null);
        onUpdate(id, { bonus, deduction, note: editNote });
        setEditingId(null);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditError(null);
    };

    if (payrolls.length === 0) {
        return (
            <div className="sm-empty">
                <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>
                </svg>
                <p>Chưa có bảng lương nào. Hãy chọn tháng và nhấn "Tính lương".</p>
            </div>
        );
    }

    return (
        <div className="sm-table-wrap">
            <table className="sm-table">
                <thead>
                <tr>
                    <th>Nhân viên</th>
                    <th>Giờ công</th>
                    <th>Lương/giờ</th>
                    <th>Lương cơ bản</th>
                    <th>Thưởng</th>
                    <th>Khấu trừ</th>
                    <th>Thực lĩnh</th>
                    <th>Trạng thái</th>
                    <th>Ghi chú</th>
                    <th>Thao tác</th>
                </tr>
                </thead>
                <tbody>
                {payrolls.map(p => {
                    const isEditing = editingId === p.id;
                    const isPaid = p.status === 'paid';
                    const busy = actionLoadingId === p.id;
                    return (
                        <React.Fragment key={p.id}>
                            <tr>
                                <td>{getStaffName(p.staffUid)}</td>
                                <td className="sm-table__mono">{p.totalHours.toFixed(2)}h</td>
                                <td className="sm-table__mono">{fmtMoney(p.hourlyRate)}</td>
                                <td className="sm-table__mono">{fmtMoney(p.baseSalary)}</td>
                                <td className="sm-table__mono">
                                    {isEditing ? (
                                        <input
                                            type="number"
                                            min={0}
                                            className={`sm-field__input sm-field__input--cell ${editError ? 'sm-field__input--err' : ''}`}
                                            value={editBonus}
                                            onChange={e => { setEditBonus(e.target.value); setEditError(null); }}
                                        />
                                    ) : fmtMoney(p.bonus)}
                                </td>
                                <td className="sm-table__mono">
                                    {isEditing ? (
                                        <input
                                            type="number"
                                            min={0}
                                            className={`sm-field__input sm-field__input--cell ${editError ? 'sm-field__input--err' : ''}`}
                                            value={editDeduction}
                                            onChange={e => { setEditDeduction(e.target.value); setEditError(null); }}
                                        />
                                    ) : fmtMoney(p.deduction)}
                                </td>
                                <td className="sm-table__mono"><strong>{fmtMoney(p.finalSalary)}</strong></td>
                                <td>
                                    {isEditing ? (
                                        <select
                                            className="sm-field__input sm-field__input--select"
                                            value={p.status}
                                            onChange={e => onUpdate(p.id, { status: e.target.value as PayrollStatus })}
                                        >
                                            <option value="draft">Nháp</option>
                                            <option value="confirmed">Đã xác nhận</option>
                                            <option value="paid">Đã thanh toán</option>
                                        </select>
                                    ) : (
                                        <span className={`sm-status ${statusClass[p.status]}`}>{statusLabel[p.status]}</span>
                                    )}
                                </td>
                                <td>
                                    {isEditing ? (
                                        <input
                                            className="sm-field__input sm-field__input--cell"
                                            value={editNote}
                                            onChange={e => setEditNote(e.target.value)}
                                        />
                                    ) : (p.note || '—')}
                                </td>
                                <td>
                                    <div className="sm-actions">
                                        {isEditing ? (
                                            <>
                                                <button className="sm-btn sm-btn--primary sm-btn--xs" onClick={() => saveEdit(p.id)} disabled={busy}>
                                                    {busy ? '...' : 'Lưu'}
                                                </button>
                                                <button className="sm-btn sm-btn--ghost sm-btn--xs" onClick={cancelEdit}>Hủy</button>
                                            </>
                                        ) : (
                                            <button
                                                className="sm-action-btn sm-action-btn--edit"
                                                onClick={() => startEdit(p)}
                                                disabled={isPaid}
                                                title={isPaid ? 'Không thể chỉnh sửa bảng lương đã thanh toán' : 'Chỉnh sửa'}
                                            >
                                                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                                </svg>
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                            {isEditing && editError && (
                                <tr>
                                    <td colSpan={10} style={{ paddingTop: 0 }}>
                                        <span className="sm-field__error">{editError}</span>
                                    </td>
                                </tr>
                            )}
                        </React.Fragment>
                    );
                })}
                </tbody>
            </table>
        </div>
    );
};

export default PayrollTable;