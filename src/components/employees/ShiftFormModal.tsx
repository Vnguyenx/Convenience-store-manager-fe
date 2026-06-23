// src/components/admin/staff/ShiftFormModal.tsx
import React, { useState, useEffect } from 'react';
import { Shift } from '../../types/staff';

const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

interface FormData { title: string; startTime: string; endTime: string; isActive: boolean; }
interface FormErrors { title?: string; startTime?: string; endTime?: string; }

function validate(d: FormData): FormErrors {
    const errs: FormErrors = {};
    if (!d.title || d.title.trim().length < 2) errs.title = 'Tên ca phải có ít nhất 2 ký tự';
    if (!d.startTime || !TIME_REGEX.test(d.startTime)) errs.startTime = 'Định dạng HH:mm (VD: 07:00)';
    if (!d.endTime   || !TIME_REGEX.test(d.endTime))   errs.endTime   = 'Định dạng HH:mm (VD: 12:00)';
    if (!errs.startTime && !errs.endTime && d.startTime >= d.endTime)
        errs.endTime = 'Giờ kết thúc phải sau giờ bắt đầu';
    return errs;
}

interface Props {
    mode: 'create' | 'edit';
    initial?: Shift | null;
    loading: boolean;
    onSubmit: (data: FormData) => void;
    onClose: () => void;
}

const ShiftFormModal: React.FC<Props> = ({ mode, initial, loading, onSubmit, onClose }) => {
    const isEdit = mode === 'edit';
    const [form, setForm] = useState<FormData>({
        title: initial?.title || '',
        startTime: initial?.startTime || '',
        endTime: initial?.endTime || '',
        isActive: initial?.isActive ?? true,
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [touched, setTouched] = useState<Partial<Record<keyof FormData, boolean>>>({});

    useEffect(() => {
        if (initial) setForm({ title: initial.title, startTime: initial.startTime, endTime: initial.endTime, isActive: initial.isActive });
    }, [initial]);

    const set = (field: keyof FormData, value: string | boolean) => {
        const next = { ...form, [field]: value };
        setForm(next);
        if (touched[field]) setErrors(validate(next));
    };

    const blur = (field: keyof FormData) => {
        setTouched(p => ({ ...p, [field]: true }));
        setErrors(validate(form));
    };

    const handleSubmit = () => {
        setTouched({ title: true, startTime: true, endTime: true });
        const errs = validate(form);
        setErrors(errs);
        if (Object.keys(errs).length === 0) onSubmit(form);
    };

    return (
        <div className="sm-modal__backdrop" onClick={onClose}>
            <div className="sm-modal__box sm-modal__box--sm" onClick={e => e.stopPropagation()}>
                <div className="sm-modal__header">
                    <h2 className="sm-modal__title">{isEdit ? 'Chỉnh sửa ca làm việc' : 'Thêm ca mới'}</h2>
                    <button className="sm-modal__close" onClick={onClose}>✕</button>
                </div>

                <div className="sm-modal__body">
                    <div className="sm-field">
                        <label className="sm-field__label">Tên ca <span className="sm-field__req">*</span></label>
                        <input
                            className={`sm-field__input ${errors.title ? 'sm-field__input--err' : ''}`}
                            value={form.title}
                            onChange={e => set('title', e.target.value)}
                            onBlur={() => blur('title')}
                            placeholder="VD: Ca sáng"
                        />
                        {errors.title && <span className="sm-field__error">{errors.title}</span>}
                    </div>

                    <div className="sm-field-row">
                        <div className="sm-field">
                            <label className="sm-field__label">Giờ bắt đầu <span className="sm-field__req">*</span></label>
                            <input
                                className={`sm-field__input ${errors.startTime ? 'sm-field__input--err' : ''}`}
                                type="time"
                                value={form.startTime}
                                onChange={e => set('startTime', e.target.value)}
                                onBlur={() => blur('startTime')}
                            />
                            {errors.startTime && <span className="sm-field__error">{errors.startTime}</span>}
                        </div>
                        <div className="sm-field">
                            <label className="sm-field__label">Giờ kết thúc <span className="sm-field__req">*</span></label>
                            <input
                                className={`sm-field__input ${errors.endTime ? 'sm-field__input--err' : ''}`}
                                type="time"
                                value={form.endTime}
                                onChange={e => set('endTime', e.target.value)}
                                onBlur={() => blur('endTime')}
                            />
                            {errors.endTime && <span className="sm-field__error">{errors.endTime}</span>}
                        </div>
                    </div>

                    {isEdit && (
                        <div className="sm-field">
                            <label className="sm-field__label">Trạng thái</label>
                            <div className="sm-toggle">
                                <button
                                    type="button"
                                    className={`sm-toggle__btn ${form.isActive ? 'sm-toggle__btn--on' : ''}`}
                                    onClick={() => set('isActive', !form.isActive)}
                                >
                                    <span className="sm-toggle__knob" />
                                </button>
                                <span className="sm-toggle__label">{form.isActive ? 'Đang sử dụng' : 'Ngừng sử dụng'}</span>
                            </div>
                        </div>
                    )}
                </div>

                <div className="sm-modal__footer">
                    <button className="sm-btn sm-btn--ghost" onClick={onClose} disabled={loading}>Hủy</button>
                    <button className="sm-btn sm-btn--primary" onClick={handleSubmit} disabled={loading}>
                        {loading ? 'Đang lưu...' : isEdit ? 'Lưu thay đổi' : 'Tạo ca'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ShiftFormModal;