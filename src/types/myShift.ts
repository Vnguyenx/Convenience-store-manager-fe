// src/types/myShift.ts
// Type riêng cho chức năng tự chấm công của Staff (Ca làm của tôi),
// tách khỏi types/staff.ts vì đó là domain quản trị (admin) của nhân viên.
import { Attendance } from './staff';

export const NOTE_MAX_LENGTH = 200;

export interface CheckInPayload {
    note?: string;
}

export interface CheckOutPayload {
    note?: string;
}

export interface MyAttendanceFilters {
    from?: string; // "YYYY-MM-DD"
    to?: string;   // "YYYY-MM-DD"
}

export interface MyAttendanceResponse {
    total: number;
    totalHours: number;
    records: Attendance[];
}