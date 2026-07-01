// src/services/staffService.ts
import { getAuth } from 'firebase/auth';
import {
    Staff, Shift, ShiftAssignment, AssignmentFilters,
    Attendance, AttendanceFilters, AttendanceUpdateData, AttendanceSummaryItem,
    Payroll, PayrollConfig, PayrollFilters, PayrollUpdateData,
} from '../types/staff';

const API = 'http://localhost:5000/api' || process.env.REACT_APP_API_URL;

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

// ── Staff ─────────────────────────────────────────────────────────────────────

export const staffService = {
    async getAllStaff(params: { role?: string; isActive?: boolean } = {}): Promise<Staff[]> {
        const qs = new URLSearchParams();
        if (params.role !== undefined) qs.set('role', params.role);
        if (params.isActive !== undefined) qs.set('isActive', String(params.isActive));
        const q = qs.toString() ? `?${qs}` : '';
        const data = await apiFetch<{ staff: Staff[] }>(`/admin/staff${q}`);
        return data.staff;
    },

    async getStaffById(uid: string): Promise<Staff> {
        return apiFetch<Staff>(`/admin/staff/${uid}`);
    },

    async createStaff(body: {
        email: string; password: string; fullName: string; phone: string; role: string; tier?: string; // FIX
    }): Promise<{ message: string; user: Staff }> {
        return apiFetch(`/admin/staff`, { method: 'POST', body: JSON.stringify(body) });
    },

    async updateStaff(uid: string, body: Partial<Staff>): Promise<void> {
        await apiFetch(`/admin/staff/${uid}`, { method: 'PUT', body: JSON.stringify(body) });
    },

    async deleteStaff(uid: string, hard = false): Promise<void> {
        await apiFetch(`/admin/staff/${uid}${hard ? '?hard=true' : ''}`, { method: 'DELETE' });
    },

    async resetPassword(uid: string, newPassword: string): Promise<void> {
        await apiFetch(`/admin/staff/${uid}/reset-password`, {
            method: 'POST',
            body: JSON.stringify({ newPassword }),
        });
    },

    // ── Shifts ────────────────────────────────────────────────────────────────

    async getAllShifts(): Promise<Shift[]> {
        const data = await apiFetch<{ shifts: Shift[] }>(`/admin/shifts`);
        return data.shifts;
    },

    async createShift(body: { title: string; startTime: string; endTime: string }): Promise<Shift> {
        const data = await apiFetch<{ id: string }>(`/admin/shifts`, {
            method: 'POST',
            body: JSON.stringify(body),
        });
        return { id: data.id, ...body, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    },

    async updateShift(id: string, body: Partial<Shift>): Promise<void> {
        await apiFetch(`/admin/shifts/${id}`, { method: 'PUT', body: JSON.stringify(body) });
    },

    async deleteShift(id: string): Promise<void> {
        await apiFetch(`/admin/shifts/${id}`, { method: 'DELETE' });
    },

    // ── Assignments (có lọc theo status — backend hiện chưa hỗ trợ filter status
    //    nên lọc thêm ở phía client để không phải sửa API) ────────────────────

    async getAssignments(params: AssignmentFilters = {}): Promise<ShiftAssignment[]> {
        const qs = new URLSearchParams();
        if (params.date) qs.set('date', params.date);
        if (params.staffUid) qs.set('staffUid', params.staffUid);
        if (params.shiftId) qs.set('shiftId', params.shiftId);
        const q = qs.toString() ? `?${qs}` : '';
        const data = await apiFetch<{ assignments: ShiftAssignment[] }>(`/admin/shift-assignments${q}`);
        let list = data.assignments;
        if (params.status) list = list.filter(a => a.status === params.status);
        return list;
    },

    async createAssignment(body: { shiftId: string; staffUid: string; date: string }): Promise<ShiftAssignment> {
        const data = await apiFetch<{ id: string }>(`/admin/shift-assignments`, {
            method: 'POST',
            body: JSON.stringify(body),
        });
        return {
            id: data.id, ...body,
            status: 'scheduled',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
    },

    async deleteAssignment(id: string): Promise<void> {
        await apiFetch(`/admin/shift-assignments/${id}`, { method: 'DELETE' });
    },
};

// ── Attendance (Chấm công) ────────────────────────────────────────────────────

export const attendanceService = {
    async getAllAttendance(params: AttendanceFilters = {}): Promise<{
        total: number; summary: AttendanceSummaryItem[]; records: Attendance[];
    }> {
        const qs = new URLSearchParams();
        if (params.staffUid) qs.set('staffUid', params.staffUid);
        if (params.from) qs.set('from', params.from);
        if (params.to) qs.set('to', params.to);
        const q = qs.toString() ? `?${qs}` : '';
        return apiFetch(`/admin/attendance${q}`);
    },

    async updateAttendance(id: string, body: AttendanceUpdateData): Promise<void> {
        await apiFetch(`/admin/attendance/${id}`, { method: 'PUT', body: JSON.stringify(body) });
    },

    async deleteAttendance(id: string): Promise<void> {
        await apiFetch(`/admin/attendance/${id}`, { method: 'DELETE' });
    },
};

// ── Payroll (Lương) ───────────────────────────────────────────────────────────

export const payrollService = {
    async getConfigs(): Promise<PayrollConfig[]> {
        const data = await apiFetch<{ configs: PayrollConfig[] }>(`/admin/payroll/config`);
        return data.configs;
    },

    async setConfig(staffUidOrDefault: string, hourlyRate: number): Promise<void> {
        await apiFetch(`/admin/payroll/config/${staffUidOrDefault}`, {
            method: 'PUT',
            body: JSON.stringify({ hourlyRate }),
        });
    },

    async calculate(month: string, staffUid?: string): Promise<{ message: string; payrolls: Payroll[] }> {
        return apiFetch(`/admin/payroll/calculate`, {
            method: 'POST',
            body: JSON.stringify({ month, staffUid }),
        });
    },

    async getPayrolls(params: PayrollFilters = {}): Promise<Payroll[]> {
        const qs = new URLSearchParams();
        if (params.month) qs.set('month', params.month);
        if (params.staffUid) qs.set('staffUid', params.staffUid);
        if (params.status) qs.set('status', params.status);
        const q = qs.toString() ? `?${qs}` : '';
        const data = await apiFetch<{ payrolls: Payroll[] }>(`/admin/payroll${q}`);
        return data.payrolls;
    },

    async updatePayroll(id: string, body: PayrollUpdateData): Promise<void> {
        await apiFetch(`/admin/payroll/${id}`, { method: 'PUT', body: JSON.stringify(body) });
    },
};