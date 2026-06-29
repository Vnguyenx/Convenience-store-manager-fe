// src/store/purchaseOrderSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { purchaseOrderService } from '../services/purchaseOrderService';
import { PurchaseOrder } from '../types/models';

interface PurchaseOrderState {
    items: PurchaseOrder[];
    currentOrder: PurchaseOrder | null;
    loading: boolean;
    error: string | null;
}

const initialState: PurchaseOrderState = {
    items: [],
    currentOrder: null,
    loading: false,
    error: null,
};

export const fetchPurchaseOrders = createAsyncThunk(
    'purchaseOrders/fetchAll',
    async (status: string | undefined, { rejectWithValue }) => {
        try {
            return await purchaseOrderService.getAll(status);
        } catch (err: any) {
            return rejectWithValue(err.message);
        }
    }
);

export const fetchPurchaseOrderDetail = createAsyncThunk(
    'purchaseOrders/fetchDetail',
    async (id: string, { rejectWithValue }) => {
        try {
            return await purchaseOrderService.getById(id);
        } catch (err: any) {
            return rejectWithValue(err.message);
        }
    }
);

export const createPurchaseOrder = createAsyncThunk(
    'purchaseOrders/create',
    async (payload: Parameters<typeof purchaseOrderService.create>[0], { dispatch, rejectWithValue }) => {
        try {
            const res = await purchaseOrderService.create(payload);
            dispatch(fetchPurchaseOrders(undefined));
            return res;
        } catch (err: any) {
            return rejectWithValue(err.message);
        }
    }
);

export const updatePurchaseOrder = createAsyncThunk(
    'purchaseOrders/update',
    async ({ id, payload }: { id: string; payload: any }, { dispatch, rejectWithValue }) => {
        try {
            const res = await purchaseOrderService.update(id, payload);
            dispatch(fetchPurchaseOrders(undefined));
            dispatch(fetchPurchaseOrderDetail(id));
            return res;
        } catch (err: any) {
            return rejectWithValue(err.message);
        }
    }
);

export const confirmPurchaseOrder = createAsyncThunk(
    'purchaseOrders/confirm',
    async (id: string, { dispatch, rejectWithValue }) => {
        try {
            const res = await purchaseOrderService.confirm(id);
            dispatch(fetchPurchaseOrders(undefined)); // invalidate -> stockQuantity sản phẩm cũng đã đổi ở BE
            return res;
        } catch (err: any) {
            return rejectWithValue(err.message);
        }
    }
);

export const cancelPurchaseOrder = createAsyncThunk(
    'purchaseOrders/cancel',
    async (id: string, { dispatch, rejectWithValue }) => {
        try {
            const res = await purchaseOrderService.cancel(id);
            dispatch(fetchPurchaseOrders(undefined));
            return res;
        } catch (err: any) {
            return rejectWithValue(err.message);
        }
    }
);

export const deletePurchaseOrder = createAsyncThunk(
    'purchaseOrders/delete',
    async (id: string, { dispatch, rejectWithValue }) => {
        try {
            const res = await purchaseOrderService.remove(id);
            dispatch(fetchPurchaseOrders(undefined));
            return res;
        } catch (err: any) {
            return rejectWithValue(err.message);
        }
    }
);

const purchaseOrderSlice = createSlice({
    name: 'purchaseOrders',
    initialState,
    reducers: {
        clearCurrentOrder(state) { state.currentOrder = null; },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchPurchaseOrders.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchPurchaseOrders.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload.purchaseOrders;
            })
            .addCase(fetchPurchaseOrders.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(fetchPurchaseOrderDetail.fulfilled, (state, action) => {
                state.currentOrder = action.payload;
            });
    },
});

export const { clearCurrentOrder } = purchaseOrderSlice.actions;
export default purchaseOrderSlice.reducer;