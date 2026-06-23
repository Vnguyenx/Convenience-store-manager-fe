// src/components/employees/PayrollConfigModal.tsx
import React, { useState } from 'react';
import { PayrollConfig, Staff } from '../../types/staff';

interface Props {
    configs: PayrollConfig[];
    staffList: Staff[];
    loading: boolean;
    onSubmit: (staffUidOrDefault: string, hourlyRate: number) => void;
    onClose: () => void;
}

const PayrollConfigModal: React.FC<Props> = ({ configs, staffList, loading, onSubmit, onClose }) => {
    const defaultRate = configs.find(c => c.id === 'default')?.hourlyRate ?? 0;

    const [target, setTarget] = useState<string>('default');
    const [rate, setRate] = useState<string>(String(defaultRate || ''));
    const [error, setError] = useState<string | null>(null);

    const currentRateFor = (uidOrDefault: string) => {
        const cfg = configs.find(c => c.id === uidOrDefault);
        return cfg ? cfg.hourlyRate : (uidOrDefault === 'default' ? 0 : defaultRate);
    };

    const handleTargetChange = (val: string) => {
        setTarget(val);
        setRate(String(currentRateFor(val) || ''));
        setError(null);
    };

    const handleSubmit = () => {
        const n = Number(rate);
        if (rate === '' || isNaN(n) || n < 0) {
            setError('Mức lương/giờ phải là số không âm');
            return;
        }
        onSubmit(target, n);
    };

    return (
        <div className="sm-modal__backdrop" onClick={onClose}>
            <div className="sm-modal__box sm-modal__box--sm" onClick={e => e.stopPropagation()}>
                <div className="sm-modal__header">
                    <h2 className="sm-modal__title">Cấu hình lương theo giờ</h2>
                    <button className="sm-modal__close" onClick={onClose}>✕</button>
                </div>

                <div className="sm-modal__body">
                    <p className="sm-modal__desc">
                        Đặt mức lương/giờ mặc định, hoặc riêng cho từng nhân viên (sẽ ưu tiên hơn mức mặc định).
                    </p>

                    <div className="sm-field">
                        <label className="sm-field__label">Áp dụng cho</label>
                        <select
                            className="sm-field__input sm-field__input--select"
                            value={target}
                            onChange={e => handleTargetChange(e.target.value)}
                        >
                            <option value="default">Mức mặc định (tất cả nhân viên)</option>
                            {staffList.filter(s => s.role === 'staff').map(s => (
                                <option key={s.uid} value={s.uid}>{s.fullName}</option>
                            ))}
                        </select>
                    </div>

                    <div className="sm-field">
                        <label className="sm-field__label">Mức lương / giờ (VNĐ) <span className="sm-field__req">*</span></label>
                        <input
                            type="number"
                            min={0}
                            className={`sm-field__input ${error ? 'sm-field__input--err' : ''}`}
                            value={rate}
                            onChange={e => { setRate(e.target.value); setError(null); }}
                            placeholder="VD: 25000"
                        />
                        {error && <span className="sm-field__error">{error}</span>}
                    </div>

                    {/* Danh sách config hiện có */}
                    {configs.length > 0 && (
                        <div className="sm-table-wrap">
                            <table className="sm-table">
                                <thead>
                                <tr><th>Đối tượng</th><th>Lương/giờ</th></tr>
                                </thead>
                                <tbody>
                                {configs.map(c => (
                                    <tr key={c.id}>
                                        <td>{c.id === 'default' ? 'Mặc định' : (staffList.find(s => s.uid === c.id)?.fullName || c.id)}</td>
                                        <td className="sm-table__mono">{c.hourlyRate.toLocaleString('vi-VN')}đ</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                <div className="sm-modal__footer">
                    <button className="sm-btn sm-btn--ghost" onClick={onClose} disabled={loading}>Hủy</button>
                    <button className="sm-btn sm-btn--primary" onClick={handleSubmit} disabled={loading}>
                        {loading ? 'Đang lưu...' : 'Lưu cấu hình'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PayrollConfigModal;
