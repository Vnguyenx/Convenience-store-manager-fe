import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../../store/hooks';
import { UserRole } from '../../types/models';

interface Props {
    children: ReactNode;
    allowedRoles?: UserRole[];
}

function ProtectedRoute({ children, allowedRoles }: Props) {
    const { user, isAuthenticated, loading } = useAppSelector((state) => state.auth);

    if (loading) return <div>Đang tải...</div>;
    if (!isAuthenticated || !user) return <Navigate to="/login" replace />;
    if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />;

    return <>{children}</>;
}

export default ProtectedRoute;