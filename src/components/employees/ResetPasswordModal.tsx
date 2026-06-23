// src/components/admin/staff/ResetPasswordModal.tsx
import React, { useState } from 'react';

const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z0-9]{8,}$/;

interface Props {
    staffName: string;
    loading: boolean;
    onSubmit: (newPassword: string) => void;
    onClose: () => void;
}

const ResetPasswordModal: React.FC<Props> = ({ staffName, loading, onSubmit, onClose }) => {
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [errors, setErrors] = useState<{ password?: string; confirm?: string }>({});
    const [touched, setTouched] = useState<{ password?: boolean; confirm?: boolean }>({});

    const validate = (pw: string, cf: string) => {
        const errs: { password?: string; confirm?: string } = {};
        if (!pw) errs.password = 'Vui lòng nhập mật khẩu mới';
        else if (!PASSWORD_REGEX.test(pw))
            errs.password = 'Tối thiểu 8 ký tự, gồm cả chữ và số, không ký tự đặc biệt';
        if (!cf) errs.confirm = 'Vui lòng xác nhận mật khẩu';
        else if (pw !== cf) errs.confirm = 'Mật khẩu xác nhận không khớp';
        return errs;
    };

    const blurPw = () => {
        setTouched(p => ({ ...p, password: true }));
        setErrors(validate(password, confirm));
    };
    const blurCf = () => {
        setTouched(p => ({ ...p, confirm: true }));
        setErrors(validate(password, confirm));
    };

    const handleSubmit = () => {
        setTouched({ password: true, confirm: true });
        const errs = validate(password, confirm);
        setErrors(errs);
        if (Object.keys(errs).length === 0) onSubmit(password);
    };

    return (
        <div className="sm-modal__backdrop" onClick={onClose}>
            <div className="sm-modal__box sm-modal__box--sm" onClick={e => e.stopPropagation()}>
                <div className="sm-modal__header">
                    <h2 className="sm-modal__title">Reset mật khẩu</h2>
                    <button className="sm-modal__close" onClick={onClose}>✕</button>
                </div>

                <div className="sm-modal__body">
                    <p className="sm-modal__desc">
                        Đặt mật khẩu mới cho <strong>{staffName}</strong>.
                        Nhân viên cần dùng mật khẩu này để đăng nhập lại.
                    </p>

                    <div className="sm-field">
                        <label className="sm-field__label">Mật khẩu mới <span className="sm-field__req">*</span></label>
                        <input
                            className={`sm-field__input ${touched.password && errors.password ? 'sm-field__input--err' : ''}`}
                            type="password"
                            value={password}
                            onChange={e => { setPassword(e.target.value); if (touched.password) setErrors(validate(e.target.value, confirm)); }}
                            onBlur={blurPw}
                            placeholder="Tối thiểu 8 ký tự, gồm chữ và số"
                        />
                        {touched.password && errors.password && <span className="sm-field__error">{errors.password}</span>}
                    </div>

                    <div className="sm-field">
                        <label className="sm-field__label">Xác nhận mật khẩu <span className="sm-field__req">*</span></label>
                        <input
                            className={`sm-field__input ${touched.confirm && errors.confirm ? 'sm-field__input--err' : ''}`}
                            type="password"
                            value={confirm}
                            onChange={e => { setConfirm(e.target.value); if (touched.confirm) setErrors(validate(password, e.target.value)); }}
                            onBlur={blurCf}
                            placeholder="Nhập lại mật khẩu mới"
                        />
                        {touched.confirm && errors.confirm && <span className="sm-field__error">{errors.confirm}</span>}
                    </div>
                </div>

                <div className="sm-modal__footer">
                    <button className="sm-btn sm-btn--ghost" onClick={onClose} disabled={loading}>Hủy</button>
                    <button className="sm-btn sm-btn--warning" onClick={handleSubmit} disabled={loading}>
                        {loading ? 'Đang cập nhật...' : 'Đặt lại mật khẩu'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ResetPasswordModal;