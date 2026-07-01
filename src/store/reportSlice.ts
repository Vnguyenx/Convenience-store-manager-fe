// src/store/reportSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { reportService } from '../services/reportService';
import type {
    RevenueOverview,
    RevenueByTimeResponse,
    RevenueByPaymentMethodResponse,
    TopProductsResponse,
    RevenueByStaffResponse,
    RevenueByCategoryResponse,
    GroupBy,
} from '../types/report';

// ─── Query params ────────────────────────────────────────────────────────────

export interface RevenueQuery {
    from: string | null;   // "YYYY-MM-DD" hoặc null
    to: string | null;
    compare: boolean;      // chỉ dùng cho overview
    groupBy: GroupBy;      // chỉ dùng cho by-time
    topLimit: number;      // chỉ dùng cho top-products
}

// ─── Async thunks ────────────────────────────────────────────────────────────

export const fetchRevenueOverview = createAsyncThunk(
    'report/fetchOverview',
    async (query: Pick<RevenueQuery, 'from' | 'to' | 'compare'>, { rejectWithValue }) => {
        try {
            return await reportService.getRevenueOverview(query.from, query.to, query.compare);
        } catch (e: any) {
            return rejectWithValue(e.message ?? 'Lỗi tải tổng quan');
        }
    }
);

export const fetchRevenueByTime = createAsyncThunk(
    'report/fetchByTime',
    async (query: Pick<RevenueQuery, 'from' | 'to' | 'groupBy'>, { rejectWithValue }) => {
        try {
            return await reportService.getRevenueByTime(query.from, query.to, query.groupBy);
        } catch (e: any) {
            return rejectWithValue(e.message ?? 'Lỗi tải biểu đồ');
        }
    }
);

export const fetchRevenueByPaymentMethod = createAsyncThunk(
    'report/fetchByPayment',
    async (query: Pick<RevenueQuery, 'from' | 'to'>, { rejectWithValue }) => {
        try {
            return await reportService.getRevenueByPaymentMethod(query.from, query.to);
        } catch (e: any) {
            return rejectWithValue(e.message ?? 'Lỗi tải phương thức');
        }
    }
);

export const fetchTopProducts = createAsyncThunk(
    'report/fetchTopProducts',
    async (query: Pick<RevenueQuery, 'from' | 'to' | 'topLimit'>, { rejectWithValue }) => {
        try {
            return await reportService.getTopProducts(query.from, query.to, query.topLimit);
        } catch (e: any) {
            return rejectWithValue(e.message ?? 'Lỗi tải top sản phẩm');
        }
    }
);

export const fetchRevenueByStaff = createAsyncThunk(
    'report/fetchByStaff',
    async (query: Pick<RevenueQuery, 'from' | 'to'>, { rejectWithValue }) => {
        try {
            return await reportService.getRevenueByStaff(query.from, query.to);
        } catch (e: any) {
            return rejectWithValue(e.message ?? 'Lỗi tải nhân viên');
        }
    }
);

export const fetchRevenueByCategory = createAsyncThunk(
    'report/fetchByCategory',
    async (query: Pick<RevenueQuery, 'from' | 'to'>, { rejectWithValue }) => {
        try {
            return await reportService.getRevenueByCategory(query.from, query.to);
        } catch (e: any) {
            return rejectWithValue(e.message ?? 'Lỗi tải danh mục');
        }
    }
);

// ─── State ───────────────────────────────────────────────────────────────────

type AsyncStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

interface AsyncSlot<T> {
    data: T | null;
    status: AsyncStatus;
    error: string | null;
}

function makeSlot<T>(): AsyncSlot<T> {
    return { data: null, status: 'idle', error: null };
}

interface ReportState {
    // bộ lọc hiện tại (dùng chung cho tất cả section)
    query: RevenueQuery;

    overview:      AsyncSlot<RevenueOverview>;
    byTime:        AsyncSlot<RevenueByTimeResponse>;
    byPayment:     AsyncSlot<RevenueByPaymentMethodResponse>;
    topProducts:   AsyncSlot<TopProductsResponse>;
    byStaff:       AsyncSlot<RevenueByStaffResponse>;
    byCategory:    AsyncSlot<RevenueByCategoryResponse>;
}

// Default: 30 ngày gần nhất
function defaultFrom(): string {
    const d = new Date();
    d.setDate(d.getDate() - 29);
    return d.toISOString().split('T')[0];
}
function todayStr(): string {
    return new Date().toISOString().split('T')[0];
}

const initialState: ReportState = {
    query: {
        from: defaultFrom(),
        to: todayStr(),
        compare: true,
        groupBy: 'day',
        topLimit: 10,
    },
    overview:    makeSlot(),
    byTime:      makeSlot(),
    byPayment:   makeSlot(),
    topProducts: makeSlot(),
    byStaff:     makeSlot(),
    byCategory:  makeSlot(),
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function setPending<T>(slot: AsyncSlot<T>) {
    slot.status = 'loading';
    slot.error  = null;
}
function setFulfilled<T>(slot: AsyncSlot<T>, data: T) {
    slot.status = 'succeeded';
    slot.data   = data;
}
function setRejected<T>(slot: AsyncSlot<T>, msg: string) {
    slot.status = 'failed';
    slot.error  = msg;
}

// ─── Slice ───────────────────────────────────────────────────────────────────

const reportSlice = createSlice({
    name: 'report',
    initialState,
    reducers: {
        setQuery(state, action: PayloadAction<Partial<RevenueQuery>>) {
            state.query = { ...state.query, ...action.payload };
        },
        resetReport(state) {
            Object.assign(state, initialState);
        },
    },
    extraReducers: (builder) => {
        // overview
        builder
            .addCase(fetchRevenueOverview.pending,   (s) => setPending(s.overview))
            .addCase(fetchRevenueOverview.fulfilled, (s, a) => setFulfilled(s.overview, a.payload))
            .addCase(fetchRevenueOverview.rejected,  (s, a) => setRejected(s.overview, a.payload as string));

        // by-time
        builder
            .addCase(fetchRevenueByTime.pending,   (s) => setPending(s.byTime))
            .addCase(fetchRevenueByTime.fulfilled, (s, a) => setFulfilled(s.byTime, a.payload))
            .addCase(fetchRevenueByTime.rejected,  (s, a) => setRejected(s.byTime, a.payload as string));

        // by-payment
        builder
            .addCase(fetchRevenueByPaymentMethod.pending,   (s) => setPending(s.byPayment))
            .addCase(fetchRevenueByPaymentMethod.fulfilled, (s, a) => setFulfilled(s.byPayment, a.payload))
            .addCase(fetchRevenueByPaymentMethod.rejected,  (s, a) => setRejected(s.byPayment, a.payload as string));

        // top-products
        builder
            .addCase(fetchTopProducts.pending,   (s) => setPending(s.topProducts))
            .addCase(fetchTopProducts.fulfilled, (s, a) => setFulfilled(s.topProducts, a.payload))
            .addCase(fetchTopProducts.rejected,  (s, a) => setRejected(s.topProducts, a.payload as string));

        // by-staff
        builder
            .addCase(fetchRevenueByStaff.pending,   (s) => setPending(s.byStaff))
            .addCase(fetchRevenueByStaff.fulfilled, (s, a) => setFulfilled(s.byStaff, a.payload))
            .addCase(fetchRevenueByStaff.rejected,  (s, a) => setRejected(s.byStaff, a.payload as string));

        // by-category
        builder
            .addCase(fetchRevenueByCategory.pending,   (s) => setPending(s.byCategory))
            .addCase(fetchRevenueByCategory.fulfilled, (s, a) => setFulfilled(s.byCategory, a.payload))
            .addCase(fetchRevenueByCategory.rejected,  (s, a) => setRejected(s.byCategory, a.payload as string));
    },
});

export const { setQuery, resetReport } = reportSlice.actions;
export default reportSlice.reducer;