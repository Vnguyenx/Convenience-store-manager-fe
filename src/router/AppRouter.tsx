import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import ProtectedRoute from '../pages/auth/ProtectedRoute';
import AdminDashboard from '../pages/admin/AdminDashboard';
import POSPage from '../pages/staff/POSPage';
import ProfilePage from '../pages/ProfilePage';

function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Navigate to="/login" replace />} />

                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                <Route
                    path="/admin/dashboard"
                    element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <AdminDashboard />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/pos"
                    element={
                        <ProtectedRoute allowedRoles={['staff', 'admin']}>
                            <POSPage />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/profile"
                    element={
                        <ProtectedRoute allowedRoles={['admin', 'staff']}>
                            <ProfilePage />
                        </ProtectedRoute>
                    }
                />

                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default AppRouter;