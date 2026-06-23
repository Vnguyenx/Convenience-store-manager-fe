// src/components/employees/AttendanceEditModal.tsx
import React, { useState } from 'react';
import { Attendance } from '../../types/staff';

interface FormData {
    checkIn: string;  // datetime-local string
    checkOut: string;
    note: string;
}

interface Props {
    record: Attendance;
    staffName: string;
    loading: boolean;
    onSubmit: (data: { checkIn?: string | null; checkOut?: string | null; note?: string }) => void;
    onClose: () => void;
}

// ISO <-> input[type=datetime-local] (giữ giờ local, không quy đổi timezone)
function isoToLocalInput(iso: string | null): string {
    if (!iso) return '';
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function localInputToIso(local: string): string | null {
    if (!local) return null;
    const d = new Date(local);
    return isNaN(d.getTime()) ? null : d.toISOString();
}

const AttendanceEditModal: React.FC<Props> = ({ record, staffName, loading, onSubmit, onClose }) => {
    const [form, setForm] = useState<FormData>({
        checkIn: isoToLocalInput(record.checkIn),
        checkOut: isoToLocalInput(record.checkOut),
        note: record.note || '',
    });
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = () => {
        const checkInIso = localInputToIso(form.checkIn);
        const checkOutIso = localInputToIso(form.checkOut);

        if (form.checkIn && !checkInIso) { setError('Giờ vào không hợp lệ'); return; }
        if (form.checkOut && !checkOutIso) { setError('Giờ ra không hợp lệ'); return; }
        if (checkInIso && checkOutIso && new Date(checkOutIso) <= new Date(checkInIso)) {
            setError('Giờ ra phải sau giờ vào');
            return;
        }
        setError(null);
        onSubmit({ checkIn: checkInIso, checkOut: checkOutIso, note: form.note });
    };

    return (
        <div className="sm-modal__backdrop" onClick={onClose}>
            <div className="sm-modal__box sm-modal__box--sm" onClick={e => e.stopPropagation()}>
                <div className="sm-modal__header">
                    <h2 className="sm-modal__title">Chỉnh sửa chấm công</h2>
                    <button className="sm-modal__close" onClick={onClose}>✕</button>
                </div>

                <div className="sm-modal__body">
                    <p className="sm-modal__desc">
                        Bản ghi chấm công ngày <strong>{record.date}</strong> của <strong>{staffName}</strong>.
                    </p>

                    <div className="sm-field-row">
                        <div className="sm-field">
                            <label className="sm-field__label">Giờ vào</label>
                            <input
                                type="datetime-local"
                                className="sm-field__input"
                                value={form.checkIn}
                                onChange={e => setForm(f => ({ ...f, checkIn: e.target.value }))}
                            />
                        </div>
                        <div className="sm-field">
                            <label className="sm-field__label">Giờ ra</label>
                            <input
                                type="datetime-local"
                                className="sm-field__input"
                                value={form.checkOut}
                                onChange={e => setForm(f => ({ ...f, checkOut: e.target.value }))}
                            />
                        </div>
                    </div>

                    <div className="sm-field">
                        <label className="sm-field__label">Ghi chú</label>
                        <input
                            className="sm-field__input"
                            value={form.note}
                            onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
                            placeholder="Ghi chú (nếu có)"
                        />
                    </div>

                    {error && <span className="sm-field__error">{error}</span>}
                </div>

                <div className="sm-modal__footer">
                    <button className="sm-btn sm-btn--ghost" onClick={onClose} disabled={loading}>Hủy</button>
                    <button className="sm-btn sm-btn--primary" onClick={handleSubmit} disabled={loading}>
                        {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AttendanceEditModal;
