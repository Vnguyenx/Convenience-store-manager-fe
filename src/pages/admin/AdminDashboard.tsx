import AdminLayout from '../../components/layout/AdminLayout';
import { useAppSelector } from '../../store/hooks';

function AdminDashboard() {
    const user = useAppSelector((state) => state.auth.user);

    return (
        <AdminLayout>
            <h1>Admin Dashboard</h1>
            <p>Xin chào, {user?.fullName} (role: {user?.role})</p>
            <p>Đây là trang tạm để test luồng đăng nhập / đăng xuất cho Admin.</p>
        </AdminLayout>
    );
}

export default AdminDashboard;