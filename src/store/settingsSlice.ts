// src/store/settingsSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { ExpiryDiscountTier } from '../types/models';
import * as settingsService from '../services/settingsService';

interface SettingsState {
    expiryDiscountTiers: ExpiryDiscountTier[];
    loading: boolean;
    error: string | null;
}

const initialState: SettingsState = {
    expiryDiscountTiers: [],
    loading: false,
    error: null,
};

export const fetchExpiryDiscountTiers = createAsyncThunk(
    'settings/fetchExpiryDiscountTiers',
    async (_, { rejectWithValue }) => {
        try {
            return await settingsService.getExpiryDiscountTiers();
        } catch (err: any) {
            return rejectWithValue(err.message);
        }
    }
);

export const saveExpiryDiscountTiers = createAsyncThunk(
    'settings/saveExpiryDiscountTiers',
    async (tiers: ExpiryDiscountTier[], { rejectWithValue }) => {
        try {
            return await settingsService.updateExpiryDiscountTiers(tiers);
        } catch (err: any) {
            return rejectWithValue(err.message);
        }
    }
);

const settingsSlice = createSlice({
    name: 'settings',
    initialState,
    reducers: {
        clearSettingsError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchExpiryDiscountTiers.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchExpiryDiscountTiers.fulfilled, (state, action: PayloadAction<ExpiryDiscountTier[]>) => {
                state.loading = false;
                state.expiryDiscountTiers = action.payload;
            })
            .addCase(fetchExpiryDiscountTiers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(saveExpiryDiscountTiers.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(saveExpiryDiscountTiers.fulfilled, (state, action: PayloadAction<ExpiryDiscountTier[]>) => {
                state.loading = false;
                state.expiryDiscountTiers = action.payload;
            })
            .addCase(saveExpiryDiscountTiers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { clearSettingsError } = settingsSlice.actions;
export default settingsSlice.reducer;