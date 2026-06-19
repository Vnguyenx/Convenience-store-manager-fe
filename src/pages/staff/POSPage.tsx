import StaffLayout from '../../components/layout/StaffLayout';
import { useAppSelector } from '../../store/hooks';

function POSPage() {
    const user = useAppSelector((state) => state.auth.user);

    return (
        <StaffLayout>
            <h1>Màn hình bán hàng (POS)</h1>
            <p>Xin chào, {user?.fullName} (role: {user?.role})</p>
            <p>Đây là trang tạm để test luồng đăng nhập / đăng xuất cho Staff.</p>
        </StaffLayout>
    );
}

export default POSPage;