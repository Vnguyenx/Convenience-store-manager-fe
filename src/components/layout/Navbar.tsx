import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { logoutUser } from '../../services/authService';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logout } from '../../store/authSlice';
import '../../styles/layout/navbar.css';

function Navbar() {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const user = useAppSelector((state) => state.auth.user);
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    // Đóng dropdown khi click ra ngoài
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleLogout = async () => {
        await logoutUser();
        dispatch(logout());
        navigate('/login');
    };

    const roleLabel = user?.role === 'admin' ? 'Quản lý' : 'Thu ngân';
    const initial = user?.fullName?.[0]?.toUpperCase() || '?';

    return (
        <nav className="navbar">
            <span className="navbar__title">Store Manager</span>

            <div className="navbar__user-area" ref={ref}>
                <button className="navbar__avatar-btn" onClick={() => setOpen(p => !p)}>
                    {user?.photoURL
                        ? <img src={user.photoURL} alt="avatar" className="navbar__avatar-img" />
                        : <span className="navbar__avatar-placeholder">{initial}</span>
                    }
                    <span className="navbar__user-info">
                        <span className="navbar__user-name">{user?.fullName}</span>
                        <span className="navbar__user-role">{roleLabel}</span>
                    </span>
                    <svg className={`navbar__chevron ${open ? 'open' : ''}`} viewBox="0 0 24 24" width="16" height="16">
                        <polyline points="6 9 12 15 18 9" />
                    </svg>
                </button>

                {open && (
                    <div className="navbar__dropdown">
                        <Link to="/profile" className="navbar__dropdown-item" onClick={() => setOpen(false)}>
                            <svg viewBox="0 0 24 24" width="16" height="16">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                <circle cx="12" cy="7" r="4" />
                            </svg>
                            Trang cá nhân
                        </Link>
                        <div className="navbar__dropdown-divider" />
                        <button className="navbar__dropdown-item navbar__dropdown-item--danger" onClick={handleLogout}>
                            <svg viewBox="0 0 24 24" width="16" height="16">
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                <polyline points="16 17 21 12 16 7" />
                                <line x1="21" y1="12" x2="9" y2="12" />
                            </svg>
                            Đăng xuất
                        </button>
                    </div>
                )}
            </div>
        </nav>
    );
}

export default Navbar;