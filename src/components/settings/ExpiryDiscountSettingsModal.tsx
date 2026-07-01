// src/components/settings/ExpiryDiscountSettingsModal.tsx
import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchExpiryDiscountTiers, saveExpiryDiscountTiers, clearSettingsError } from '../../store/settingsSlice';
import { ExpiryDiscountTier } from '../../types/models';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';

interface ExpiryDiscountSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ExpiryDiscountSettingsModal: React.FC<ExpiryDiscountSettingsModalProps> = ({ isOpen, onClose }) => {
    const dispatch = useAppDispatch();
    const { expiryDiscountTiers, loading, error } = useAppSelector((state) => state.settings);

    const [rows, setRows] = useState<ExpiryDiscountTier[]>([]);
    const [formError, setFormError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Mỗi lần mở modal, load lại tier mới nhất từ server
    useEffect(() => {
        if (isOpen) {
            dispatch(fetchExpiryDiscountTiers());
            dispatch(clearSettingsError());
            setFormError('');
        }
    }, [isOpen, dispatch]);

    // Khi tier từ server load xong, đổ vào state form để chỉnh
    useEffect(() => {
        if (expiryDiscountTiers.length > 0) {
            setRows(expiryDiscountTiers);
        }
    }, [expiryDiscountTiers]);

    const handleRowChange = (index: number, field: keyof ExpiryDiscountTier, value: string) => {
        const num = Number(value);
        setRows((prev) => prev.map((r, i) => (i === index ? { ...r, [field]: isNaN(num) ? 0 : num } : r)));
    };

    const handleAddRow = () => {
        setRows((prev) => [...prev, { maxDays: 0, percent: 0 }]);
    };

    const handleRemoveRow = (index: number) => {
        setRows((prev) => prev.filter((_, i) => i !== index));
    };

    const validate = (): boolean => {
        if (rows.length === 0) {
            setFormError('Phải có ít nhất 1 tier');
            return false;
        }
        for (const r of rows) {
            if (r.maxDays < 0) {
                setFormError('Số ngày (maxDays) không được âm');
                return false;
            }
            if (r.percent <= 0 || r.percent > 100) {
                setFormError('% giảm phải lớn hơn 0 và không vượt quá 100');
                return false;
            }
        }
        setFormError('');
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        setSubmitting(true);
        try {
            await dispatch(saveExpiryDiscountTiers(rows)).unwrap();
            onClose();
        } catch (err) {
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Cấu hình giảm giá cận hạn sử dụng">
            <form onSubmit={handleSubmit} className="product-form">
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginTop: 0 }}>
                    Sản phẩm còn <strong>từ 0 đến X ngày</strong> đến hạn sẽ tự động giảm <strong>Y%</strong> khi bán.
                    Không ảnh hưởng đến giá gốc lưu trong hệ thống.
                </p>

                {loading && rows.length === 0 ? (
                    <div>Đang tải...</div>
                ) : (
                    <>
                        {rows.map((row, index) => (
                            <div className="form-row" key={index} style={{ alignItems: 'flex-end' }}>
                                <div className="form-group">
                                    <label>Còn tối đa (ngày)</label>
                                    <Input
                                        type="number"
                                        value={row.maxDays}
                                        onChange={(e) => handleRowChange(index, 'maxDays', e.target.value)}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Giảm (%)</label>
                                    <Input
                                        type="number"
                                        value={row.percent}
                                        onChange={(e) => handleRowChange(index, 'percent', e.target.value)}
                                    />
                                </div>
                                <div className="form-group">
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={() => handleRemoveRow(index)}
                                        disabled={rows.length === 1}
                                    >
                                        Xoá
                                    </Button>
                                </div>
                            </div>
                        ))}

                        <Button type="button" variant="secondary" onClick={handleAddRow}>
                            + Thêm mức
                        </Button>
                    </>
                )}

                {(formError || error) && <div className="alert alert-danger">{formError || error}</div>}

                <div className="form-actions">
                    <Button type="button" variant="secondary" onClick={onClose}>Hủy</Button>
                    <Button type="submit" variant="primary" disabled={submitting || loading}>
                        {submitting ? 'Đang lưu...' : 'Lưu cấu hình'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default ExpiryDiscountSettingsModal;