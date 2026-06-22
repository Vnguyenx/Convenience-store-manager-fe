// src/components/coupons/CouponFormModal.tsx
import React, { useState, useEffect } from 'react';
import { Coupon, CouponFormData } from '../../types/coupon';

interface Props {
    coupon?: Coupon | null;
    onClose: () => void;
    onSave: (data: CouponFormData) => Promise<void>;
    saving: boolean;
    error?: string | null;
}

const empty: CouponFormData = {
    code: '',
    type: 'percent',
    value: 0,
    description: '',
    minOrderValue: 0,
    maxDiscount: undefined,
    startDate: '',
    expiryDate: '',
    usageLimit: undefined,
    isActive: true,
};

/* ─── kiểu lỗi cho từng field ─── */
type FormErrors = Partial<Record<keyof CouponFormData, string>>;

/* ─── hàm validate ─── */
function validate(form: CouponFormData, isEdit: boolean): FormErrors {
    const errors: FormErrors = {};

    // code
    if (!isEdit) {
        const code = form.code.trim();
        if (!code) {
            errors.code = 'Mã coupon không được để trống';
        } else if (code.length < 3) {
            errors.code = 'Mã phải có ít nhất 3 ký tự';
        } else if (code.length > 20) {
            errors.code = 'Mã không được vượt quá 20 ký tự';
        } else if (!/^[A-Z0-9_]+$/.test(code)) {
            errors.code = 'Chỉ dùng chữ in hoa, số và dấu gạch dưới';
        }
    }

    // type
    if (!form.type) {
        errors.type = 'Vui lòng chọn loại giảm giá';
    }

    // value
    if (form.value === undefined || form.value === null || String(form.value) === '') {
        errors.value = 'Giá trị giảm không được để trống';
    } else if (form.value <= 0) {
        errors.value = 'Giá trị phải lớn hơn 0';
    } else if (form.type === 'percent' && form.value > 100) {
        errors.value = 'Phần trăm không được vượt quá 100%';
    } else if (form.type === 'fixed' && form.value > 100_000_000) {
        errors.value = 'Số tiền giảm không hợp lệ';
    }

    // minOrderValue
    if (form.minOrderValue !== undefined && form.minOrderValue < 0) {
        errors.minOrderValue = 'Đơn tối thiểu không được âm';
    }
    if (
        form.type === 'fixed' &&
        form.minOrderValue !== undefined &&
        form.value > 0 &&
        form.minOrderValue > 0 &&
        form.value >= form.minOrderValue
    ) {
        errors.value = 'Số tiền giảm phải nhỏ hơn đơn tối thiểu';
    }

    // maxDiscount (chỉ khi percent)
    if (form.type === 'percent' && form.maxDiscount !== undefined) {
        if (form.maxDiscount <= 0) {
            errors.maxDiscount = 'Giảm tối đa phải lớn hơn 0';
        } else if (form.maxDiscount > 100_000_000) {
            errors.maxDiscount = 'Giá trị không hợp lệ';
        }
    }

    // usageLimit
    if (form.usageLimit !== undefined) {
        if (!Number.isInteger(form.usageLimit) || form.usageLimit < 1) {
            errors.usageLimit = 'Giới hạn phải là số nguyên ≥ 1';
        } else if (form.usageLimit > 1_000_000) {
            errors.usageLimit = 'Giới hạn quá lớn';
        }
    }

    // startDate / expiryDate
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (form.startDate) {
        const start = new Date(form.startDate);
        // Kiểm tra ngày bắt đầu: khi thêm mới, phải >= hôm nay
        if (!isEdit && start < today) {
            errors.startDate = 'Ngày bắt đầu phải từ hôm nay trở đi';
        }
    }

    if (form.startDate && form.expiryDate) {
        if (new Date(form.expiryDate) <= new Date(form.startDate)) {
            errors.expiryDate = 'Ngày hết hạn phải sau ngày bắt đầu';
        }
    }
    if (form.expiryDate && !form.startDate) {
        // allowed — no error
    }
    if (form.startDate && !form.expiryDate) {
        // allowed — no error
    }

    return errors;
}

/* ─── helper: field với error ─── */
interface FieldProps {
    label: string;
    error?: string;
    required?: boolean;
    children: React.ReactNode;
    full?: boolean;
}

const Field: React.FC<FieldProps> = ({ label, error, required, children, full }) => (
    <div className={`form-field${error ? ' form-field--error' : ''}${full ? ' form-field--full' : ''}`}>
        <label>{label}{required && ' *'}</label>
        {children}
        {error && <span className="form-field__error-msg">{error}</span>}
    </div>
);

/* ─── Component ─── */
const CouponFormModal: React.FC<Props> = ({ coupon, onClose, onSave, saving, error }) => {
    const isEdit = !!coupon;
    const [form, setForm] = useState<CouponFormData>(empty);
    const [errors, setErrors] = useState<FormErrors>({});
    const [touched, setTouched] = useState<Partial<Record<keyof CouponFormData, boolean>>>({});

    // Ngày hôm nay dạng YYYY-MM-DD để dùng cho input date
    const todayStr = new Date().toISOString().slice(0, 10);

    useEffect(() => {
        if (coupon) {
            setForm({
                code:          coupon.code,
                type:          coupon.type,
                value:         coupon.value,
                description:   coupon.description || '',
                minOrderValue: coupon.minOrderValue || 0,
                maxDiscount:   coupon.maxDiscount ?? undefined,
                startDate:     coupon.startDate?.slice(0, 10) || '',
                expiryDate:    coupon.expiryDate?.slice(0, 10) || '',
                usageLimit:    coupon.usageLimit ?? undefined,
                isActive:      coupon.isActive,
            });
        } else {
            setForm(empty);
        }
        setErrors({});
        setTouched({});
    }, [coupon]);

    const set = <K extends keyof CouponFormData>(key: K, val: CouponFormData[K]) => {
        const next = { ...form, [key]: val };
        setForm(next);
        // re-validate field khi đã touch
        if (touched[key]) {
            const e = validate(next, isEdit);
            setErrors(prev => ({ ...prev, [key]: e[key] }));
        }
    };

    const touch = (key: keyof CouponFormData) => {
        if (touched[key]) return;
        setTouched(prev => ({ ...prev, [key]: true }));
        const e = validate(form, isEdit);
        setErrors(prev => ({ ...prev, [key]: e[key] }));
    };

    const handleSubmit = async () => {
        // mark all fields touched
        const allTouched = Object.fromEntries(
            Object.keys(empty).map(k => [k, true])
        ) as typeof touched;
        setTouched(allTouched);

        const e = validate(form, isEdit);
        setErrors(e);
        if (Object.keys(e).length > 0) return;

        await onSave(form);
    };

    return (
        <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="modal">
                <div className="modal__header">
                    <h2 className="modal__title">{isEdit ? 'Chỉnh sửa coupon' : 'Tạo coupon mới'}</h2>
                    <button className="modal__close" onClick={onClose}>
                        <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                </div>

                <div className="modal__body">
                    {error && <div className="modal-error">{error}</div>}

                    {/* Mã & loại */}
                    <div className="form-row">
                        <Field label="Mã coupon" required error={errors.code}>
                            <input
                                placeholder="VD: SALE20"
                                value={form.code}
                                onChange={e => set('code', e.target.value.toUpperCase().replace(/\s/g, ''))}
                                onBlur={() => touch('code')}
                                disabled={isEdit}
                                style={isEdit ? { opacity: 0.6 } : undefined}
                                maxLength={20}
                            />
                        </Field>

                        <Field label="Loại giảm giá" required error={errors.type}>
                            <select
                                value={form.type}
                                onChange={e => set('type', e.target.value as 'percent' | 'fixed')}
                                onBlur={() => touch('type')}
                            >
                                <option value="percent">Phần trăm (%)</option>
                                <option value="fixed">Số tiền cố định (₫)</option>
                            </select>
                        </Field>
                    </div>

                    {/* Giá trị & min order */}
                    <div className="form-row">
                        <Field
                            label={form.type === 'percent' ? 'Giá trị (%)' : 'Số tiền giảm (₫)'}
                            required
                            error={errors.value}
                        >
                            <input
                                type="number"
                                min={0}
                                max={form.type === 'percent' ? 100 : undefined}
                                step={form.type === 'percent' ? 1 : 1000}
                                placeholder={form.type === 'percent' ? '1–100' : '0'}
                                value={form.value || ''}
                                onChange={e => set('value', Number(e.target.value))}
                                onBlur={() => touch('value')}
                            />
                        </Field>

                        <Field label="Đơn hàng tối thiểu (₫)" error={errors.minOrderValue}>
                            <input
                                type="number"
                                min={0}
                                step={1000}
                                placeholder="Không giới hạn"
                                value={form.minOrderValue || ''}
                                onChange={e => set('minOrderValue', Number(e.target.value))}
                                onBlur={() => touch('minOrderValue')}
                            />
                        </Field>
                    </div>

                    {/* Max discount & usage limit */}
                    <div className="form-row">
                        {form.type === 'percent' && (
                            <Field label="Giảm tối đa (₫)" error={errors.maxDiscount}>
                                <input
                                    type="number"
                                    min={0}
                                    step={1000}
                                    placeholder="Không giới hạn"
                                    value={form.maxDiscount ?? ''}
                                    onChange={e => set('maxDiscount', e.target.value ? Number(e.target.value) : undefined)}
                                    onBlur={() => touch('maxDiscount')}
                                />
                            </Field>
                        )}
                        <Field label="Giới hạn lượt dùng" error={errors.usageLimit}>
                            <input
                                type="number"
                                min={1}
                                step={1}
                                placeholder="Không giới hạn"
                                value={form.usageLimit ?? ''}
                                onChange={e => set('usageLimit', e.target.value ? Number(e.target.value) : undefined)}
                                onBlur={() => touch('usageLimit')}
                            />
                        </Field>
                    </div>

                    {/* Ngày */}
                    <div className="form-row">
                        <Field label="Ngày bắt đầu" error={errors.startDate}>
                            <input
                                type="date"
                                value={form.startDate}
                                min={!isEdit ? todayStr : undefined}  // 👈 Chỉ áp dụng khi thêm mới
                                onChange={e => set('startDate', e.target.value)}
                                onBlur={() => touch('startDate')}
                            />
                        </Field>
                        <Field label="Ngày hết hạn" error={errors.expiryDate}>
                            <input
                                type="date"
                                value={form.expiryDate}
                                min={form.startDate || undefined}
                                onChange={e => set('expiryDate', e.target.value)}
                                onBlur={() => touch('expiryDate')}
                            />
                        </Field>
                    </div>

                    {/* Mô tả */}
                    <Field label="Mô tả" full>
                        <textarea
                            placeholder="Ghi chú về coupon này..."
                            value={form.description}
                            onChange={e => set('description', e.target.value)}
                            maxLength={200}
                        />
                    </Field>

                    {/* Toggle active */}
                    <div className="toggle-row">
                        <span className="toggle-row__label">Kích hoạt coupon</span>
                        <label className="toggle">
                            <input
                                type="checkbox"
                                checked={form.isActive}
                                onChange={e => set('isActive', e.target.checked)}
                            />
                            <span className="toggle__slider" />
                        </label>
                    </div>
                </div>

                <div className="modal__footer">
                    <button className="btn btn--outline" onClick={onClose} disabled={saving}>
                        Huỷ
                    </button>
                    <button className="btn btn--primary" onClick={handleSubmit} disabled={saving}>
                        {saving ? 'Đang lưu…' : isEdit ? 'Cập nhật' : 'Tạo coupon'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CouponFormModal;