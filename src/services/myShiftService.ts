// src/services/myShiftService.ts
// Service riêng cho Staff tự chấm công (check-in/check-out/xem lịch sử của bản thân).
// Tách khỏi staffService.ts vì đó là service cho Admin quản lý nhân viên khác.
import { getAuth } from 'firebase/auth';
import {
    CheckInPayload, CheckOutPayload, MyAttendanceFilters, MyAttendanceResponse,
} from '../types/myShift';

const API = 'http://localhost:5000/api/admin' || process.env.REACT_APP_API_URL;

async function getToken(): Promise<string> {
    const user = getAuth().currentUser;
    if (!user) throw new Error('Chưa đăng nhập');
    return user.getIdToken();
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
    const token = await getToken();
    const res = await fetch(`${API}${path}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            ...(options.headers || {}),
        },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Lỗi không xác định');
    return data;
}

export const myShiftService = {
    async checkIn(body: CheckInPayload = {}): Promise<{ message: string; id: string; checkIn: string }> {
        return apiFetch(`/attendance/check-in`, {
            method: 'POST',
            body: JSON.stringify(body),
        });
    },

    async checkOut(body: CheckOutPayload = {}): Promise<{ message: string; hoursWorked: number }> {
        return apiFetch(`/attendance/check-out`, {
            method: 'PUT',
            body: JSON.stringify(body),
        });
    },

    async getMyAttendance(params: MyAttendanceFilters = {}): Promise<MyAttendanceResponse> {
        const qs = new URLSearchParams();
        if (params.from) qs.set('from', params.from);
        if (params.to) qs.set('to', params.to);
        const q = qs.toString() ? `?${qs}` : '';
        return apiFetch(`/attendance/me${q}`);
    },
};