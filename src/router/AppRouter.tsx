import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import ProtectedRoute from '../pages/auth/ProtectedRoute';
import AdminDashboard from '../pages/admin/AdminDashboard';
import POSPage from '../pages/staff/POSPage';
import ProfilePage from '../pages/ProfilePage';
import AdminProductsPage from '../pages/admin/AdminProductsPage';
import ProductLookupPage from '../pages/staff/ProductLookupPage';
import MyShiftPage from '../pages/staff/MyShiftPage';
import HistoryStaffPage from '../pages/staff/HistoryStaffPage';
import AdminTransactionsPage from '../pages/admin/AdminTransactionsPage';
import AdminCouponsPage from "../pages/admin/AdminCouponsPage";


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

                <Route
                    path="/admin/products"
                    element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <AdminProductsPage />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/products/lookup"
                    element={
                        <ProtectedRoute allowedRoles={['staff', 'admin']}>
                            <ProductLookupPage />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/staff/shift"
                    element={
                        <ProtectedRoute allowedRoles={['staff', 'admin']}>
                            <MyShiftPage />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/staff/history"
                    element={
                        <ProtectedRoute allowedRoles={['staff', 'admin']}>
                            <HistoryStaffPage />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/admin/transactions"
                    element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <AdminTransactionsPage />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/admin/promotions"
                    element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <AdminCouponsPage />
                        </ProtectedRoute>
                    }
                />

            </Routes>
        </BrowserRouter>
    );
}

export default AppRouter;