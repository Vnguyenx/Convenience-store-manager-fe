// src/services/couponService.ts  (UPDATED — thêm admin CRUD)
import { getAuth } from 'firebase/auth';
import { Coupon, CouponFormData } from '../types/coupon';

const API_BASE_URL = 'http://localhost:5000/api';

const getToken = async (): Promise<string> => {
    const user = getAuth().currentUser;
    if (!user) throw new Error('Chưa đăng nhập');
    return user.getIdToken();
};

const handleRes = async <T>(res: Response): Promise<T> => {
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.message || 'Lỗi server');
    return json.data as T;
};

/* ── Lấy coupon đang active (staff + POS) ── */
export const getActiveCoupons = async (): Promise<Coupon[]> => {
    const token = await getToken();
    const res = await fetch(`${API_BASE_URL}/coupons?active=true`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return handleRes<Coupon[]>(res);
};

/* ── Lấy TẤT CẢ coupon (admin) ── */
export const getAllCoupons = async (): Promise<Coupon[]> => {
    const token = await getToken();
    const res = await fetch(`${API_BASE_URL}/coupons?active=false`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return handleRes<Coupon[]>(res);
};

/* ── Tạo coupon (admin) ── */
export const createCoupon = async (data: CouponFormData): Promise<Coupon> => {
    const token = await getToken();
    const res = await fetch(`${API_BASE_URL}/coupons`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    return handleRes<Coupon>(res);
};

/* ── Cập nhật coupon (admin) ── */
export const updateCoupon = async (id: string, data: Partial<CouponFormData>): Promise<Coupon> => {
    const token = await getToken();
    const res = await fetch(`${API_BASE_URL}/coupons/${id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    return handleRes<Coupon>(res);
};

/* ── Xoá coupon (admin) ── */
export const deleteCoupon = async (id: string): Promise<void> => {
    const token = await getToken();
    const res = await fetch(`${API_BASE_URL}/coupons/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
        const json = await res.json();
        throw new Error(json.message || 'Lỗi xoá coupon');
    }
};