// src/store/myShiftSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { myShiftService } from '../services/myShiftService';
import { MyAttendanceFilters, MyAttendanceResponse } from '../types/myShift';
import { Attendance } from '../types/staff';

interface MyShiftState {
    todayCheckIn: string | null;    // ISO timestamp của check-in hôm nay (nếu có)
    todayCheckOut: string | null;   // ISO timestamp của check-out hôm nay (nếu có)
    history: Attendance[];
    total: number;
    totalHours: number;
    loading: {
        checkIn: boolean;
        checkOut: boolean;
        history: boolean;
    };
    error: string | null;
}

const initialState: MyShiftState = {
    todayCheckIn: null,
    todayCheckOut: null,
    history: [],
    total: 0,
    totalHours: 0,
    loading: {
        checkIn: false,
        checkOut: false,
        history: false,
    },
    error: null,
};

// Async thunks
export const checkIn = createAsyncThunk(
    'myShift/checkIn',
    async (note?: string) => {
        const result = await myShiftService.checkIn({ note });
        return result; // { message, id, checkIn }
    }
);

export const checkOut = createAsyncThunk(
    'myShift/checkOut',
    async (note?: string) => {
        const result = await myShiftService.checkOut({ note });
        return result; // { message, hoursWorked }
    }
);

export const fetchMyAttendance = createAsyncThunk(
    'myShift/fetchHistory',
    async (filters?: MyAttendanceFilters) => {
        const data = await myShiftService.getMyAttendance(filters);
        return data; // MyAttendanceResponse
    }
);

const myShiftSlice = createSlice({
    name: 'myShift',
    initialState,
    reducers: {
        clearError(state) {
            state.error = null;
        },
        resetToday(state) {
            state.todayCheckIn = null;
            state.todayCheckOut = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Check-in
            .addCase(checkIn.pending, (state) => {
                state.loading.checkIn = true;
                state.error = null;
            })
            .addCase(checkIn.fulfilled, (state, action) => {
                state.loading.checkIn = false;
                state.todayCheckIn = action.payload.checkIn;
                // Có thể fetch lại lịch sử để cập nhật danh sách? Không cần thiết vì hôm nay vừa tạo
                // Nhưng nếu muốn cập nhật lịch sử, có thể thêm record mới vào đầu mảng history
                // Tuy nhiên, ta nên fetch lại history sau khi check-in/out để đồng bộ
            })
            .addCase(checkIn.rejected, (state, action) => {
                state.loading.checkIn = false;
                state.error = action.error.message || 'Check-in thất bại';
            })
            // Check-out
            .addCase(checkOut.pending, (state) => {
                state.loading.checkOut = true;
                state.error = null;
            })
            .addCase(checkOut.fulfilled, (state) => {
                state.loading.checkOut = false;
                // Cập nhật todayCheckOut sẽ được set sau khi fetch lại history
                // Hoặc có thể set tạm, nhưng tốt nhất fetch lại history
            })
            .addCase(checkOut.rejected, (state, action) => {
                state.loading.checkOut = false;
                state.error = action.error.message || 'Check-out thất bại';
            })
            // Fetch history
            .addCase(fetchMyAttendance.pending, (state) => {
                state.loading.history = true;
                state.error = null;
            })
            .addCase(fetchMyAttendance.fulfilled, (state, action: PayloadAction<MyAttendanceResponse>) => {
                state.loading.history = false;
                state.history = action.payload.records;
                state.total = action.payload.total;
                state.totalHours = action.payload.totalHours;

                // Cập nhật trạng thái hôm nay (nếu có)
                const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' });
                const todayRecord = action.payload.records.find(r => r.date === today);
                if (todayRecord) {
                    state.todayCheckIn = todayRecord.checkIn || null;
                    state.todayCheckOut = todayRecord.checkOut || null;
                } else {
                    state.todayCheckIn = null;
                    state.todayCheckOut = null;
                }
            })
            .addCase(fetchMyAttendance.rejected, (state, action) => {
                state.loading.history = false;
                state.error = action.error.message || 'Lấy lịch sử thất bại';
            });
    },
});

export const { clearError, resetToday } = myShiftSlice.actions;
export default myShiftSlice.reducer;