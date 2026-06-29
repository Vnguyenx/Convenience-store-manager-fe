// src/store/inventorySlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { inventoryService } from '../services/inventoryService';
import { InventoryCheck, InventoryAlerts } from '../types/models';

interface InventoryState {
    checks: InventoryCheck[];
    currentCheck: InventoryCheck | null;
    alerts: InventoryAlerts | null;
    loading: boolean;
    alertsLoading: boolean;
    error: string | null;
}

const initialState: InventoryState = {
    checks: [],
    currentCheck: null,
    alerts: null,
    loading: false,
    alertsLoading: false,
    error: null,
};

export const fetchInventoryChecks = createAsyncThunk(
    'inventory/fetchChecks',
    async (status: string | undefined, { rejectWithValue }) => {
        try {
            return await inventoryService.getAllChecks(status);
        } catch (err: any) {
            return rejectWithValue(err.message);
        }
    }
);

export const fetchInventoryCheckDetail = createAsyncThunk(
    'inventory/fetchCheckDetail',
    async (id: string, { rejectWithValue }) => {
        try {
            return await inventoryService.getCheckById(id);
        } catch (err: any) {
            return rejectWithValue(err.message);
        }
    }
);

export const createInventoryCheck = createAsyncThunk(
    'inventory/createCheck',
    async (payload: { note?: string; productIds?: string[] }, { dispatch, rejectWithValue }) => {
        try {
            const res = await inventoryService.createCheck(payload);
            dispatch(fetchInventoryChecks(undefined));
            return res;
        } catch (err: any) {
            return rejectWithValue(err.message);
        }
    }
);

export const updateInventoryCheckItem = createAsyncThunk(
    'inventory/updateCheckItem',
    async (
        { checkId, itemId, actualQuantity, note }: { checkId: string; itemId: string; actualQuantity: number; note?: string },
        { dispatch, rejectWithValue }
    ) => {
        try {
            const res = await inventoryService.updateCheckItem(checkId, itemId, { actualQuantity, note });
            dispatch(fetchInventoryCheckDetail(checkId)); // invalidate detail để cập nhật difference
            return res;
        } catch (err: any) {
            return rejectWithValue(err.message);
        }
    }
);

export const confirmInventoryCheck = createAsyncThunk(
    'inventory/confirmCheck',
    async (id: string, { dispatch, rejectWithValue }) => {
        try {
            const res = await inventoryService.confirmCheck(id);
            dispatch(fetchInventoryChecks(undefined));
            dispatch(fetchInventoryCheckDetail(id));
            return res;
        } catch (err: any) {
            return rejectWithValue(err.message);
        }
    }
);

export const deleteInventoryCheck = createAsyncThunk(
    'inventory/deleteCheck',
    async (id: string, { dispatch, rejectWithValue }) => {
        try {
            const res = await inventoryService.deleteCheck(id);
            dispatch(fetchInventoryChecks(undefined));
            return res;
        } catch (err: any) {
            return rejectWithValue(err.message);
        }
    }
);

export const fetchInventoryAlerts = createAsyncThunk(
    'inventory/fetchAlerts',
    async (days: number | undefined, { rejectWithValue }) => {
        try {
            return await inventoryService.getAlerts(days);
        } catch (err: any) {
            return rejectWithValue(err.message);
        }
    }
);

const inventorySlice = createSlice({
    name: 'inventory',
    initialState,
    reducers: {
        clearCurrentCheck(state) {
            state.currentCheck = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchInventoryChecks.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchInventoryChecks.fulfilled, (state, action) => {
                state.loading = false;
                state.checks = action.payload.checks;
            })
            .addCase(fetchInventoryChecks.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(fetchInventoryCheckDetail.fulfilled, (state, action) => {
                state.currentCheck = action.payload;
            })
            .addCase(fetchInventoryAlerts.pending, (state) => { state.alertsLoading = true; })
            .addCase(fetchInventoryAlerts.fulfilled, (state, action) => {
                state.alertsLoading = false;
                state.alerts = action.payload;
            })
            .addCase(fetchInventoryAlerts.rejected, (state) => { state.alertsLoading = false; });
    },
});

export const { clearCurrentCheck } = inventorySlice.actions;
export default inventorySlice.reducer;