// src/store/slices/staffSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { staffService, attendanceService, payrollService } from '../services/staffService';
import {
    Staff, Shift, ShiftAssignment, AssignmentFilters,
    Attendance, AttendanceFilters, AttendanceSummaryItem, AttendanceUpdateData,
    Payroll, PayrollConfig, PayrollFilters, PayrollUpdateData,
    PaginationState, DEFAULT_PAGE_SIZE,
} from '../types/staff';

// Re-export để các file cũ import từ staffSlice vẫn chạy được (tương thích ngược)
export type { Staff, Shift, ShiftAssignment, Attendance, Payroll, PayrollConfig };

// ── State ─────────────────────────────────────────────────────────────────────

interface StaffState {
    // Staff
    staffList: Staff[];
    staffLoading: boolean;
    staffError: string | null;

    // Shifts
    shiftList: Shift[];
    shiftLoading: boolean;
    shiftError: string | null;

    // Assignments
    assignmentList: ShiftAssignment[];
    assignmentLoading: boolean;
    assignmentError: string | null;
    assignmentFilters: AssignmentFilters;
    assignmentPagination: PaginationState;

    // Attendance
    attendanceList: Attendance[];
    attendanceSummary: AttendanceSummaryItem[];
    attendanceLoading: boolean;
    attendanceError: string | null;
    attendanceFilters: AttendanceFilters;
    attendancePagination: PaginationState;

    // Payroll
    payrollList: Payroll[];
    payrollConfigs: PayrollConfig[];
    payrollLoading: boolean;
    payrollError: string | null;
    payrollFilters: PayrollFilters;
    payrollPagination: PaginationState;
}

const initialState: StaffState = {
    staffList: [],
    staffLoading: false,
    staffError: null,

    shiftList: [],
    shiftLoading: false,
    shiftError: null,

    assignmentList: [],
    assignmentLoading: false,
    assignmentError: null,
    assignmentFilters: {},
    assignmentPagination: { page: 1, pageSize: DEFAULT_PAGE_SIZE },

    attendanceList: [],
    attendanceSummary: [],
    attendanceLoading: false,
    attendanceError: null,
    attendanceFilters: {},
    attendancePagination: { page: 1, pageSize: DEFAULT_PAGE_SIZE },

    payrollList: [],
    payrollConfigs: [],
    payrollLoading: false,
    payrollError: null,
    payrollFilters: {},
    payrollPagination: { page: 1, pageSize: DEFAULT_PAGE_SIZE },
};

// ── Thunks: Staff ─────────────────────────────────────────────────────────────

export const fetchAllStaff = createAsyncThunk(
    'staff/fetchAll',
    async (params: { role?: string; isActive?: boolean } = {}, { rejectWithValue }) => {
        try {
            return await staffService.getAllStaff(params);
        } catch (e: any) {
            return rejectWithValue(e.message);
        }
    }
);

export const createStaff = createAsyncThunk(
    'staff/create',
    async (data: { email: string; password: string; fullName: string; phone: string; role: string; tier?: string }, { rejectWithValue }) => {
        try {
            return await staffService.createStaff(data);
        } catch (e: any) {
            return rejectWithValue(e.message);
        }
    }
);

export const updateStaff = createAsyncThunk(
    'staff/update',
    async ({ uid, data }: { uid: string; data: Partial<Staff> }, { rejectWithValue }) => {
        try {
            await staffService.updateStaff(uid, data);
            return { uid, data };
        } catch (e: any) {
            return rejectWithValue(e.message);
        }
    }
);

export const deleteStaff = createAsyncThunk(
    'staff/delete',
    async ({ uid, hard = false }: { uid: string; hard?: boolean }, { rejectWithValue }) => {
        try {
            await staffService.deleteStaff(uid, hard);
            return { uid, hard };
        } catch (e: any) {
            return rejectWithValue(e.message);
        }
    }
);

export const resetStaffPassword = createAsyncThunk(
    'staff/resetPassword',
    async ({ uid, newPassword }: { uid: string; newPassword: string }, { rejectWithValue }) => {
        try {
            await staffService.resetPassword(uid, newPassword);
        } catch (e: any) {
            return rejectWithValue(e.message);
        }
    }
);

// ── Thunks: Shifts ────────────────────────────────────────────────────────────

export const fetchAllShifts = createAsyncThunk(
    'staff/fetchShifts',
    async (_, { rejectWithValue }) => {
        try {
            return await staffService.getAllShifts();
        } catch (e: any) {
            return rejectWithValue(e.message);
        }
    }
);

export const createShift = createAsyncThunk(
    'staff/createShift',
    async (data: { title: string; startTime: string; endTime: string }, { rejectWithValue }) => {
        try {
            return await staffService.createShift(data);
        } catch (e: any) {
            return rejectWithValue(e.message);
        }
    }
);

export const updateShift = createAsyncThunk(
    'staff/updateShift',
    async ({ id, data }: { id: string; data: Partial<Shift> }, { rejectWithValue }) => {
        try {
            await staffService.updateShift(id, data);
            return { id, data };
        } catch (e: any) {
            return rejectWithValue(e.message);
        }
    }
);

export const deleteShift = createAsyncThunk(
    'staff/deleteShift',
    async (id: string, { rejectWithValue }) => {
        try {
            await staffService.deleteShift(id);
            return id;
        } catch (e: any) {
            return rejectWithValue(e.message);
        }
    }
);

// ── Thunks: Assignments ───────────────────────────────────────────────────────

export const fetchAssignments = createAsyncThunk(
    'staff/fetchAssignments',
    async (params: AssignmentFilters = {}, { rejectWithValue }) => {
        try {
            return await staffService.getAssignments(params);
        } catch (e: any) {
            return rejectWithValue(e.message);
        }
    }
);

export const createAssignment = createAsyncThunk(
    'staff/createAssignment',
    async (data: { shiftId: string; staffUid: string; date: string }, { rejectWithValue }) => {
        try {
            return await staffService.createAssignment(data);
        } catch (e: any) {
            return rejectWithValue(e.message);
        }
    }
);

export const deleteAssignment = createAsyncThunk(
    'staff/deleteAssignment',
    async (id: string, { rejectWithValue }) => {
        try {
            await staffService.deleteAssignment(id);
            return id;
        } catch (e: any) {
            return rejectWithValue(e.message);
        }
    }
);

// ── Thunks: Attendance (Chấm công - Admin) ───────────────────────────────────

export const fetchAllAttendance = createAsyncThunk(
    'staff/fetchAllAttendance',
    async (params: AttendanceFilters = {}, { rejectWithValue }) => {
        try {
            return await attendanceService.getAllAttendance(params);
        } catch (e: any) {
            return rejectWithValue(e.message);
        }
    }
);

export const updateAttendance = createAsyncThunk(
    'staff/updateAttendance',
    async ({ id, data }: { id: string; data: AttendanceUpdateData }, { rejectWithValue }) => {
        try {
            await attendanceService.updateAttendance(id, data);
            return { id, data };
        } catch (e: any) {
            return rejectWithValue(e.message);
        }
    }
);

export const deleteAttendance = createAsyncThunk(
    'staff/deleteAttendance',
    async (id: string, { rejectWithValue }) => {
        try {
            await attendanceService.deleteAttendance(id);
            return id;
        } catch (e: any) {
            return rejectWithValue(e.message);
        }
    }
);

// ── Thunks: Payroll (Tính lương - Admin) ──────────────────────────────────────

export const fetchPayrollConfigs = createAsyncThunk(
    'staff/fetchPayrollConfigs',
    async (_, { rejectWithValue }) => {
        try {
            return await payrollService.getConfigs();
        } catch (e: any) {
            return rejectWithValue(e.message);
        }
    }
);

export const setPayrollConfig = createAsyncThunk(
    'staff/setPayrollConfig',
    async ({ staffUidOrDefault, hourlyRate }: { staffUidOrDefault: string; hourlyRate: number }, { rejectWithValue, dispatch }) => {
        try {
            await payrollService.setConfig(staffUidOrDefault, hourlyRate);
            await dispatch(fetchPayrollConfigs());
        } catch (e: any) {
            return rejectWithValue(e.message);
        }
    }
);

export const calculatePayroll = createAsyncThunk(
    'staff/calculatePayroll',
    async ({ month, staffUid }: { month: string; staffUid?: string }, { rejectWithValue }) => {
        try {
            return await payrollService.calculate(month, staffUid);
        } catch (e: any) {
            return rejectWithValue(e.message);
        }
    }
);

export const fetchPayrolls = createAsyncThunk(
    'staff/fetchPayrolls',
    async (params: PayrollFilters = {}, { rejectWithValue }) => {
        try {
            return await payrollService.getPayrolls(params);
        } catch (e: any) {
            return rejectWithValue(e.message);
        }
    }
);

export const updatePayroll = createAsyncThunk(
    'staff/updatePayroll',
    async ({ id, data }: { id: string; data: PayrollUpdateData }, { rejectWithValue }) => {
        try {
            await payrollService.updatePayroll(id, data);
            return { id, data };
        } catch (e: any) {
            return rejectWithValue(e.message);
        }
    }
);

// ── Slice ─────────────────────────────────────────────────────────────────────

const staffSlice1 = createSlice({
    name: 'staff',
    initialState,
    reducers: {
        clearStaffError(state) { state.staffError = null; },
        clearShiftError(state) { state.shiftError = null; },
        clearAssignmentError(state) { state.assignmentError = null; },
        clearAttendanceError(state) { state.attendanceError = null; },
        clearPayrollError(state) { state.payrollError = null; },

        // Lọc + phân trang cho Phân ca
        setAssignmentFilters(state, action: PayloadAction<AssignmentFilters>) {
            state.assignmentFilters = action.payload;
            state.assignmentPagination.page = 1;
        },
        setAssignmentPage(state, action: PayloadAction<number>) {
            state.assignmentPagination.page = action.payload;
        },
        setAssignmentPageSize(state, action: PayloadAction<number>) {
            state.assignmentPagination.pageSize = action.payload;
            state.assignmentPagination.page = 1;
        },

        // Lọc + phân trang cho Chấm công
        setAttendanceFilters(state, action: PayloadAction<AttendanceFilters>) {
            state.attendanceFilters = action.payload;
            state.attendancePagination.page = 1;
        },
        setAttendancePage(state, action: PayloadAction<number>) {
            state.attendancePagination.page = action.payload;
        },
        setAttendancePageSize(state, action: PayloadAction<number>) {
            state.attendancePagination.pageSize = action.payload;
            state.attendancePagination.page = 1;
        },

        // Lọc + phân trang cho Lương
        setPayrollFilters(state, action: PayloadAction<PayrollFilters>) {
            state.payrollFilters = action.payload;
            state.payrollPagination.page = 1;
        },
        setPayrollPage(state, action: PayloadAction<number>) {
            state.payrollPagination.page = action.payload;
        },
        setPayrollPageSize(state, action: PayloadAction<number>) {
            state.payrollPagination.pageSize = action.payload;
            state.payrollPagination.page = 1;
        },
    },
    extraReducers: (builder) => {
        // ── fetchAllStaff ──
        builder
            .addCase(fetchAllStaff.pending, (s) => { s.staffLoading = true; s.staffError = null; })
            .addCase(fetchAllStaff.fulfilled, (s, a) => { s.staffLoading = false; s.staffList = a.payload; })
            .addCase(fetchAllStaff.rejected, (s, a) => { s.staffLoading = false; s.staffError = a.payload as string; });

        // ── createStaff ──
        builder.addCase(createStaff.fulfilled, (s, a) => {
            if (a.payload?.user) s.staffList.unshift(a.payload.user);
        });

        // ── updateStaff ──
        builder.addCase(updateStaff.fulfilled, (s, a) => {
            const idx = s.staffList.findIndex(st => st.uid === a.payload.uid);
            if (idx !== -1) s.staffList[idx] = { ...s.staffList[idx], ...a.payload.data };
        });

        // ── deleteStaff ──
        builder.addCase(deleteStaff.fulfilled, (s, a) => {
            if (a.payload.hard) {
                s.staffList = s.staffList.filter(st => st.uid !== a.payload.uid);
            } else {
                const idx = s.staffList.findIndex(st => st.uid === a.payload.uid);
                if (idx !== -1) s.staffList[idx].isActive = false;
            }
        });

        // ── fetchAllShifts ──
        builder
            .addCase(fetchAllShifts.pending, (s) => { s.shiftLoading = true; s.shiftError = null; })
            .addCase(fetchAllShifts.fulfilled, (s, a) => { s.shiftLoading = false; s.shiftList = a.payload; })
            .addCase(fetchAllShifts.rejected, (s, a) => { s.shiftLoading = false; s.shiftError = a.payload as string; });

        // ── createShift ──
        builder.addCase(createShift.fulfilled, (s, a) => {
            if (a.payload) s.shiftList.push(a.payload);
        });

        // ── updateShift ──
        builder.addCase(updateShift.fulfilled, (s, a) => {
            const idx = s.shiftList.findIndex(sh => sh.id === a.payload.id);
            if (idx !== -1) s.shiftList[idx] = { ...s.shiftList[idx], ...a.payload.data };
        });

        // ── deleteShift ──
        builder.addCase(deleteShift.fulfilled, (s, a) => {
            s.shiftList = s.shiftList.filter(sh => sh.id !== a.payload);
        });

        // ── fetchAssignments ──
        builder
            .addCase(fetchAssignments.pending, (s) => { s.assignmentLoading = true; s.assignmentError = null; })
            .addCase(fetchAssignments.fulfilled, (s, a) => {
                s.assignmentLoading = false;
                s.assignmentList = a.payload;
                s.assignmentPagination.page = 1;
            })
            .addCase(fetchAssignments.rejected, (s, a) => { s.assignmentLoading = false; s.assignmentError = a.payload as string; });

        // ── createAssignment ──
        builder.addCase(createAssignment.fulfilled, (s, a) => {
            if (a.payload) s.assignmentList.push(a.payload);
        });

        // ── deleteAssignment ──
        builder.addCase(deleteAssignment.fulfilled, (s, a) => {
            s.assignmentList = s.assignmentList.filter(as => as.id !== a.payload);
        });

        // ── fetchAllAttendance ──
        builder
            .addCase(fetchAllAttendance.pending, (s) => { s.attendanceLoading = true; s.attendanceError = null; })
            .addCase(fetchAllAttendance.fulfilled, (s, a) => {
                s.attendanceLoading = false;
                s.attendanceList = a.payload.records;
                s.attendanceSummary = a.payload.summary;
                s.attendancePagination.page = 1;
            })
            .addCase(fetchAllAttendance.rejected, (s, a) => { s.attendanceLoading = false; s.attendanceError = a.payload as string; });

        // ── updateAttendance ──
        builder.addCase(updateAttendance.fulfilled, (s, a) => {
            const idx = s.attendanceList.findIndex(r => r.id === a.payload.id);
            if (idx !== -1) {
                s.attendanceList[idx] = { ...s.attendanceList[idx], ...a.payload.data };
                const rec = s.attendanceList[idx];
                if (rec.checkIn && rec.checkOut) {
                    rec.hoursWorked = parseFloat((((new Date(rec.checkOut).getTime() - new Date(rec.checkIn).getTime())) / 3.6e6).toFixed(2));
                }
            }
        });

        // ── deleteAttendance ──
        builder.addCase(deleteAttendance.fulfilled, (s, a) => {
            s.attendanceList = s.attendanceList.filter(r => r.id !== a.payload);
        });

        // ── fetchPayrollConfigs ──
        builder.addCase(fetchPayrollConfigs.fulfilled, (s, a) => { s.payrollConfigs = a.payload; });

        // ── calculatePayroll ──
        builder
            .addCase(calculatePayroll.pending, (s) => { s.payrollLoading = true; s.payrollError = null; })
            .addCase(calculatePayroll.fulfilled, (s) => { s.payrollLoading = false; })
            .addCase(calculatePayroll.rejected, (s, a) => { s.payrollLoading = false; s.payrollError = a.payload as string; });

        // ── fetchPayrolls ──
        builder
            .addCase(fetchPayrolls.pending, (s) => { s.payrollLoading = true; s.payrollError = null; })
            .addCase(fetchPayrolls.fulfilled, (s, a) => {
                s.payrollLoading = false;
                s.payrollList = a.payload;
                s.payrollPagination.page = 1;
            })
            .addCase(fetchPayrolls.rejected, (s, a) => { s.payrollLoading = false; s.payrollError = a.payload as string; });

        // ── updatePayroll ──
        builder.addCase(updatePayroll.fulfilled, (s, a) => {
            const idx = s.payrollList.findIndex(p => p.id === a.payload.id);
            if (idx !== -1) {
                const p = s.payrollList[idx];
                const bonus = a.payload.data.bonus ?? p.bonus;
                const deduction = a.payload.data.deduction ?? p.deduction;
                s.payrollList[idx] = {
                    ...p,
                    ...a.payload.data,
                    bonus,
                    deduction,
                    finalSalary: p.baseSalary + bonus - deduction,
                };
            }
        });
    },
});

export const {
    clearStaffError, clearShiftError, clearAssignmentError, clearAttendanceError, clearPayrollError,
    setAssignmentFilters, setAssignmentPage, setAssignmentPageSize,
    setAttendanceFilters, setAttendancePage, setAttendancePageSize,
    setPayrollFilters, setPayrollPage, setPayrollPageSize,
} = staffSlice1.actions;

export default staffSlice1.reducer;