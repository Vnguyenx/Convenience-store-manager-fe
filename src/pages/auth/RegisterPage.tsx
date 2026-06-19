import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../../services/authService';
import { isValidEmail, getPasswordError } from '../../utils/validators';
import { useAppDispatch } from '../../store/hooks';
import { loginStart, loginSuccess, loginFailure } from '../../store/authSlice';
import '../../styles/auth/login.css';
import '../../styles/base/base.css';


function RegisterPage() {
    const [form, setForm] = useState({ email: '', password: '', fullName: '', phone: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');

        if (!form.fullName.trim()) return setError('Vui lòng nhập họ tên');
        if (!isValidEmail(form.email)) return setError('Email không hợp lệ (phải chứa @)');
        const pwError = getPasswordError(form.password);
        if (pwError) return setError(pwError);
        if (!/^0\d{9}$/.test(form.phone)) return setError('Số điện thoại không hợp lệ (10 số, bắt đầu bằng 0)');

        setLoading(true);
        dispatch(loginStart());

        try {
            const user = await registerUser(form);
            dispatch(loginSuccess(user));
            navigate('/pos');
        } catch (err: any) {
            dispatch(loginFailure());
            setError(err.message || 'Đăng ký thất bại');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            {/* ── LEFT: Form panel ── */}
            <div className="auth-panel-form">
                {/* Brand */}
                <div className="auth-brand">
                    <div className="auth-brand__icon">
                        <svg viewBox="0 0 24 24">
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                            <polyline points="9 22 9 12 15 12 15 22"/>
                        </svg>
                    </div>
                    <span className="auth-brand__name">Store Manager</span>
                </div>

                <h2>Tạo tài khoản</h2>
                <p className="auth-subtitle">Điền thông tin để bắt đầu sử dụng hệ thống</p>

                <form onSubmit={handleSubmit} className="auth-page__form">
                    {error && <p className="error">{error}</p>}

                    <div className="auth-field">
                        <label htmlFor="reg-name">Họ tên</label>
                        <input
                            id="reg-name"
                            placeholder="Nguyễn Văn A"
                            value={form.fullName}
                            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                            required
                        />
                    </div>

                    <div className="auth-field">
                        <label htmlFor="reg-email">Email</label>
                        <input
                            id="reg-email"
                            type="email"
                            placeholder="example@email.com"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            required
                        />
                    </div>

                    <div className="auth-field">
                        <label htmlFor="reg-phone">Số điện thoại</label>
                        <input
                            id="reg-phone"
                            type="tel"
                            placeholder="0901234567"
                            value={form.phone}
                            onChange={(e) => setForm({ ...form, phone: e.target.value })}
                            required
                        />
                    </div>

                    <div className="auth-field">
                        <label htmlFor="reg-password">Mật khẩu</label>
                        <input
                            id="reg-password"
                            type="password"
                            placeholder="Tối thiểu 8 ký tự, gồm chữ và số"
                            value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                            required
                        />
                    </div>

                    <button type="submit" disabled={loading}>
                        {loading ? 'Đang đăng ký...' : 'Tạo tài khoản'}
                    </button>

                    <p>
                        Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
                    </p>
                </form>
            </div>

            {/* ── RIGHT: Visual panel ── */}
            <div className="auth-panel-visual">
                <div className="auth-visual-content">
                    <div className="auth-visual-icon">
                        <svg viewBox="0 0 24 24">
                            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                            <line x1="3" y1="6" x2="21" y2="6"/>
                            <path d="M16 10a4 4 0 0 1-8 0"/>
                        </svg>
                    </div>
                    <h1>Bắt đầu ngay hôm nay</h1>
                    <p>Tạo tài khoản để quản lý cửa hàng tiện lợi của bạn — miễn phí, không giới hạn thời gian dùng thử.</p>
                    <div className="auth-visual-pills">
                        <span>Bán hàng</span>
                        <span>Quản lý kho</span>
                        <span>Báo cáo doanh thu</span>
                        <span>Nhân viên & ca làm</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default RegisterPage;