// src/components/admin/staff/StaffFormModal.tsx
import React, { useState, useEffect } from 'react';
import { Staff } from '../../types/staff';

// ── Validation ────────────────────────────────────────────────────────────────

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z0-9]{8,}$/;
const PHONE_REGEX = /^(0|\+84)[0-9]{9}$/;

interface FormData {
    email: string;
    password: string;
    fullName: string;
    phone: string;
    role: 'admin' | 'staff';
    tier: 'excellent' | 'normal'; // FIX
    isActive: boolean;
}

interface FormErrors {
    email?: string;
    password?: string;
    fullName?: string;
    phone?: string;
    role?: string;
}

function validate(data: FormData, isEdit: boolean): FormErrors {
    const errors: FormErrors = {};
    if (!data.fullName || data.fullName.trim().length < 2)
        errors.fullName = 'Họ tên phải có ít nhất 2 ký tự';
    if (!data.email || !EMAIL_REGEX.test(data.email))
        errors.email = 'Email không hợp lệ';
    if (!isEdit) {
        if (!data.password) errors.password = 'Vui lòng nhập mật khẩu';
        else if (!PASSWORD_REGEX.test(data.password))
            errors.password = 'Tối thiểu 8 ký tự, gồm cả chữ và số, không ký tự đặc biệt';
    }
    if (data.phone && !PHONE_REGEX.test(data.phone))
        errors.phone = 'Số điện thoại không hợp lệ (VD: 0912345678)';
    return errors;
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
    mode: 'create' | 'edit';
    initial?: Staff | null;
    loading: boolean;
    onSubmit: (data: FormData) => void;
    onClose: () => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

const StaffFormModal: React.FC<Props> = ({ mode, initial, loading, onSubmit, onClose }) => {
    const isEdit = mode === 'edit';

    const [form, setForm] = useState<FormData>({
        email: initial?.email || '',
        password: '',
        fullName: initial?.fullName || '',
        phone: initial?.phone || '',
        role: initial?.role || 'staff',
        tier: initial?.tier || 'normal', // FIX
        isActive: initial?.isActive ?? true,
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [touched, setTouched] = useState<Partial<Record<keyof FormData, boolean>>>({});

    useEffect(() => {
        if (initial) {
            setForm({ email: initial.email, password: '', fullName: initial.fullName, phone: initial.phone || '', role: initial.role, tier: initial.tier || 'normal', isActive: initial.isActive }); // FIX
        }
    }, [initial]);

    const set = (field: keyof FormData, value: string | boolean) => {
        const next = { ...form, [field]: value };
        setForm(next);
        if (touched[field]) {
            const errs = validate(next, isEdit);
            setErrors(prev => ({ ...prev, [field]: errs[field as keyof FormErrors] }));
        }
    };

    const blur = (field: keyof FormData) => {
        setTouched(prev => ({ ...prev, [field]: true }));
        const errs = validate(form, isEdit);
        setErrors(prev => ({ ...prev, [field]: errs[field as keyof FormErrors] }));
    };

    const handleSubmit = () => {
        const allTouched = Object.fromEntries(Object.keys(form).map(k => [k, true]));
        setTouched(allTouched as any);
        const errs = validate(form, isEdit);
        setErrors(errs);
        if (Object.keys(errs).length === 0) onSubmit(form);
    };

    return (
        <div className="sm-modal__backdrop" onClick={onClose}>
            <div className="sm-modal__box" onClick={e => e.stopPropagation()}>
                <div className="sm-modal__header">
                    <h2 className="sm-modal__title">
                        {isEdit ? 'Chỉnh sửa nhân viên' : 'Thêm nhân viên mới'}
                    </h2>
                    <button className="sm-modal__close" onClick={onClose}>✕</button>
                </div>

                <div className="sm-modal__body">
                    {/* Họ tên */}
                    <div className="sm-field">
                        <label className="sm-field__label">Họ và tên <span className="sm-field__req">*</span></label>
                        <input
                            className={`sm-field__input ${errors.fullName ? 'sm-field__input--err' : ''}`}
                            value={form.fullName}
                            onChange={e => set('fullName', e.target.value)}
                            onBlur={() => blur('fullName')}
                            placeholder="Nguyễn Văn A"
                        />
                        {errors.fullName && <span className="sm-field__error">{errors.fullName}</span>}
                    </div>

                    {/* Email */}
                    <div className="sm-field">
                        <label className="sm-field__label">Email <span className="sm-field__req">*</span></label>
                        <input
                            className={`sm-field__input ${errors.email ? 'sm-field__input--err' : ''}`}
                            type="email"
                            value={form.email}
                            onChange={e => set('email', e.target.value)}
                            onBlur={() => blur('email')}
                            placeholder="nhanvien@csmanager.vn"
                            disabled={isEdit}
                        />
                        {errors.email && <span className="sm-field__error">{errors.email}</span>}
                    </div>

                    {/* Mật khẩu (chỉ khi tạo mới) */}
                    {!isEdit && (
                        <div className="sm-field">
                            <label className="sm-field__label">Mật khẩu <span className="sm-field__req">*</span></label>
                            <input
                                className={`sm-field__input ${errors.password ? 'sm-field__input--err' : ''}`}
                                type="password"
                                value={form.password}
                                onChange={e => set('password', e.target.value)}
                                onBlur={() => blur('password')}
                                placeholder="Tối thiểu 8 ký tự, gồm chữ và số"
                            />
                            {errors.password && <span className="sm-field__error">{errors.password}</span>}
                        </div>
                    )}

                    {/* Số điện thoại */}
                    <div className="sm-field">
                        <label className="sm-field__label">Số điện thoại</label>
                        <input
                            className={`sm-field__input ${errors.phone ? 'sm-field__input--err' : ''}`}
                            value={form.phone}
                            onChange={e => set('phone', e.target.value)}
                            onBlur={() => blur('phone')}
                            placeholder="0912345678"
                        />
                        {errors.phone && <span className="sm-field__error">{errors.phone}</span>}
                    </div>

                    {/* Row: Role + Tier */}
                    <div className="sm-field-row">
                        <div className="sm-field">
                            <label className="sm-field__label">Vai trò <span className="sm-field__req">*</span></label>
                            <select
                                className="sm-field__input sm-field__input--select"
                                value={form.role}
                                onChange={e => set('role', e.target.value)}
                            >
                                <option value="staff">Thu ngân (Staff)</option>
                                <option value="admin">Quản lý (Admin)</option>
                            </select>
                        </div>

                        {/* FIX: xếp loại nhân viên — quyết định mức lương/giờ mặc định */}
                        <div className="sm-field">
                            <label className="sm-field__label">Xếp loại</label>
                            <select
                                className="sm-field__input sm-field__input--select"
                                value={form.tier}
                                onChange={e => set('tier', e.target.value)}
                            >
                                <option value="normal">Nhân viên thường</option>
                                <option value="excellent">Nhân viên ưu tú</option>
                            </select>
                        </div>
                    </div>

                    {/* Row: isActive */}
                    {isEdit && (
                        <div className="sm-field-row">
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
                                    <span className="sm-toggle__label">
                                        {form.isActive ? 'Đang hoạt động' : 'Vô hiệu hóa'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="sm-modal__footer">
                    <button className="sm-btn sm-btn--ghost" onClick={onClose} disabled={loading}>
                        Hủy
                    </button>
                    <button className="sm-btn sm-btn--primary" onClick={handleSubmit} disabled={loading}>
                        {loading ? 'Đang lưu...' : isEdit ? 'Lưu thay đổi' : 'Tạo nhân viên'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StaffFormModal;