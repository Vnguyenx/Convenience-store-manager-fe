// src/store/couponSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Coupon } from '../types/coupon';
import * as couponService from '../services/couponService';

interface CouponState {
    coupons: Coupon[];
    loading: boolean;
    error: string | null;
}

const initialState: CouponState = {
    coupons: [],
    loading: false,
    error: null,
};

export const fetchCoupons = createAsyncThunk(
    'coupon/fetchCoupons',
    async (_, { rejectWithValue }) => {
        try {
            return await couponService.getActiveCoupons();
        } catch (err: any) {
            return rejectWithValue(err.message);
        }
    }
);

const couponSlice = createSlice({
    name: 'coupon',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchCoupons.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCoupons.fulfilled, (state, action: PayloadAction<Coupon[]>) => {
                state.loading = false;
                state.coupons = action.payload;
            })
            .addCase(fetchCoupons.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export default couponSlice.reducer;
