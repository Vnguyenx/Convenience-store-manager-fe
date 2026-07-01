// Tách toàn bộ type/interface dùng chung cho module Nhân viên / Ca làm / Chấm công / Lương
// để các file khác (service, slice, component) import vào dùng chung, tránh khai báo trùng lặp.

// ── Staff ─────────────────────────────────────────────────────────────────────

// FIX: xếp loại nhân viên, quyết định mức lương/giờ mặc định (xem PayrollConfig)
export type StaffTier = 'excellent' | 'normal';

export interface Staff {
    uid: string;
    email: string;
    fullName: string;
    phone: string;
    role: 'admin' | 'staff';
    tier: StaffTier; // FIX
    isActive: boolean;
    photoURL: string;
    createdAt: string;
    updatedAt: string;
}

export interface StaffFormData {
    email: string;
    password: string;
    fullName: string;
    phone: string;
    role: 'admin' | 'staff';
    tier: StaffTier; // FIX
    isActive: boolean;
}

// ── Shift ─────────────────────────────────────────────────────────────────────

export interface Shift {
    id: string;
    title: string;
    startTime: string; // "07:00"
    endTime: string;   // "12:00"
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export type AssignmentStatus = 'scheduled' | 'completed' | 'absent';

export interface ShiftAssignment {
    id: string;
    shiftId: string;
    staffUid: string;
    date: string; // "YYYY-MM-DD"
    status: AssignmentStatus;
    createdAt: string;
    updatedAt: string;
}

export interface AssignmentFilters {
    date?: string;
    staffUid?: string;
    shiftId?: string;
    status?: AssignmentStatus | '';
}

// ── Attendance (Chấm công) ───────────────────────────────────────────────────

export interface Attendance {
    id: string;
    staffUid: string;
    assignmentId: string | null;
    date: string;
    checkIn: string | null;
    checkOut: string | null;
    hoursWorked: number | null;
    note: string;
    createdAt: string;
    updatedAt: string;
}

export interface AttendanceFilters {
    staffUid?: string;
    from?: string;
    to?: string;
}

export interface AttendanceSummaryItem {
    staffUid: string;
    totalHours: number;
    days: number;
}

export interface AttendanceUpdateData {
    checkIn?: string | null;
    checkOut?: string | null;
    note?: string;
}

// ── Payroll (Lương) ──────────────────────────────────────────────────────────

export type PayrollStatus = 'draft' | 'confirmed' | 'paid';

export interface Payroll {
    id: string;
    staffUid: string;
    month: string; // "YYYY-MM"
    totalHours: number;
    hourlyRate: number;
    baseSalary: number;
    bonus: number;
    deduction: number;
    finalSalary: number;
    status: PayrollStatus;
    note: string;
    createdAt: string;
    updatedAt: string;
}

export interface PayrollConfig {
    id: string; // "default" | "tier_excellent" | "tier_normal" | staffUid  // FIX
    staffUid: string;
    hourlyRate: number;
    updatedAt: string;
}

export interface PayrollFilters {
    month?: string;
    staffUid?: string;
    status?: PayrollStatus | '';
}

export interface PayrollUpdateData {
    bonus?: number;
    deduction?: number;
    status?: PayrollStatus;
    note?: string;
}

// ── Phân trang (Pagination) ──────────────────────────────────────────────────

export interface PaginationState {
    page: number;     // trang hiện tại, bắt đầu từ 1
    pageSize: number; // số dòng / trang
}

export const DEFAULT_PAGE_SIZE = 10;