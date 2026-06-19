import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser } from '../../services/authService';
import { isValidEmail } from '../../utils/validators';
import { useAppDispatch } from '../../store/hooks';
import { loginStart, loginSuccess, loginFailure } from '../../store/authSlice';
import '../../styles/base/base.css';
import '../../styles/auth/login.css';

function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');

        if (!isValidEmail(email)) {
            setError('Email không hợp lệ (phải chứa @)');
            return;
        }
        if (!password) {
            setError('Vui lòng nhập mật khẩu');
            return;
        }

        setLoading(true);
        dispatch(loginStart());

        try {
            const user = await loginUser(email, password);
            dispatch(loginSuccess(user));
            navigate(user.role === 'admin' ? '/admin/dashboard' : '/pos');
        } catch (err: any) {
            dispatch(loginFailure());
            setError('Email hoặc mật khẩu không đúng');
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

                <h2>Đăng nhập</h2>
                <p className="auth-subtitle">Vui lòng đăng nhập để tiếp tục</p>

                <form onSubmit={handleSubmit} className="auth-page__form">
                    {error && <p className="error">{error}</p>}

                    <div className="auth-field">
                        <label htmlFor="login-email">Email</label>
                        <input
                            id="login-email"
                            type="email"
                            placeholder="example@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="auth-field">
                        <label htmlFor="login-password">Mật khẩu</label>
                        <input
                            id="login-password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" disabled={loading}>
                        {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                    </button>

                    <p>
                        Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
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
                    <h1>Chào mừng trở lại</h1>
                    <p>Hệ thống quản lý cửa hàng tiện lợi — bán hàng, kho, nhân viên và báo cáo trong một nơi.</p>
                    <div className="auth-visual-pills">
                        <span>Bán hàng POS</span>
                        <span>Quản lý kho</span>
                        <span>Báo cáo doanh thu</span>
                        <span>Nhân viên & ca làm</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;