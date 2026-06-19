import { useNavigate } from 'react-router-dom';
import { logoutUser } from '../../services/authService';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logout } from '../../store/authSlice';

function Navbar() {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const user = useAppSelector((state) => state.auth.user);

    const handleLogout = async () => {
        await logoutUser();
        dispatch(logout());
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <span className="navbar__user">{user?.fullName} ({user?.role === 'admin' ? 'Quản lý' : 'Thu ngân'})</span>
            <button className="navbar__logout" onClick={handleLogout}>Đăng xuất</button>
        </nav>
    );
}

export default Navbar;