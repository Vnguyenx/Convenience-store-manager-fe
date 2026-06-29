// src/store/supplierSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { supplierService } from '../services/supplierService';
import { Supplier } from '../types/models';

interface SupplierState {
    items: Supplier[];
    loading: boolean;
    error: string | null;
    filters: { isActive?: boolean; search: string };
}

const initialState: SupplierState = {
    items: [],
    loading: false,
    error: null,
    filters: { isActive: undefined, search: '' },
};

export const fetchSuppliers = createAsyncThunk(
    'suppliers/fetchAll',
    async (params: { isActive?: boolean; search?: string } | undefined, { rejectWithValue }) => {
        try {
            return await supplierService.getAll(params);
        } catch (err: any) {
            return rejectWithValue(err.message);
        }
    }
);

export const createSupplier = createAsyncThunk(
    'suppliers/create',
    async (payload: Partial<Supplier>, { dispatch, rejectWithValue }) => {
        try {
            const res = await supplierService.create(payload);
            dispatch(fetchSuppliers(undefined)); // invalidate -> reload list
            return res;
        } catch (err: any) {
            return rejectWithValue(err.message);
        }
    }
);

export const updateSupplier = createAsyncThunk(
    'suppliers/update',
    async ({ id, payload }: { id: string; payload: Partial<Supplier> }, { dispatch, rejectWithValue }) => {
        try {
            const res = await supplierService.update(id, payload);
            dispatch(fetchSuppliers(undefined));
            return res;
        } catch (err: any) {
            return rejectWithValue(err.message);
        }
    }
);

export const deactivateSupplier = createAsyncThunk(
    'suppliers/deactivate',
    async (id: string, { dispatch, rejectWithValue }) => {
        try {
            const res = await supplierService.remove(id);
            dispatch(fetchSuppliers(undefined));
            return res;
        } catch (err: any) {
            return rejectWithValue(err.message);
        }
    }
);

const supplierSlice = createSlice({
    name: 'suppliers',
    initialState,
    reducers: {
        setSupplierFilters(state, action) {
            state.filters = { ...state.filters, ...action.payload };
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchSuppliers.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchSuppliers.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload.suppliers;
            })
            .addCase(fetchSuppliers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { setSupplierFilters } = supplierSlice.actions;
export default supplierSlice.reducer;