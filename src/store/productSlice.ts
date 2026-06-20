// src/store/productSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Product } from '../types/models';
import * as productService from '../services/productService';

interface ProductState {
    products: Product[];
    selectedProduct: Product | null;
    loading: boolean;
    error: string | null;
}

const initialState: ProductState = {
    products: [],
    selectedProduct: null,
    loading: false,
    error: null,
};

// Async thunks
export const fetchProducts = createAsyncThunk(
    'product/fetchProducts',
    async (_, { rejectWithValue }) => {
        try {
            return await productService.getAllProducts();
        } catch (err: any) {
            return rejectWithValue(err.message);
        }
    }
);

export const fetchProductById = createAsyncThunk(
    'product/fetchProductById',
    async (docId: string, { rejectWithValue }) => {
        try {
            return await productService.getProductById(docId);
        } catch (err: any) {
            return rejectWithValue(err.message);
        }
    }
);

export const createProduct = createAsyncThunk(
    'product/createProduct',
    async (productData: Omit<Product, 'docId' | 'createdAt' | 'updatedAt'>, { rejectWithValue }) => {
        try {
            return await productService.createProduct(productData);
        } catch (err: any) {
            return rejectWithValue(err.message);
        }
    }
);

export const updateProduct = createAsyncThunk(
    'product/updateProduct',
    async ({ docId, data }: { docId: string; data: Partial<Product> }, { rejectWithValue }) => {
        try {
            return await productService.updateProduct(docId, data);
        } catch (err: any) {
            return rejectWithValue(err.message);
        }
    }
);

export const deleteProduct = createAsyncThunk(
    'product/deleteProduct',
    async (docId: string, { rejectWithValue }) => {
        try {
            await productService.deleteProduct(docId);
            return docId;
        } catch (err: any) {
            return rejectWithValue(err.message);
        }
    }
);

const productSlice = createSlice({
    name: 'product',
    initialState,
    reducers: {
        clearSelectedProduct: (state) => {
            state.selectedProduct = null;
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // fetchProducts
            .addCase(fetchProducts.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchProducts.fulfilled, (state, action: PayloadAction<Product[]>) => {
                state.loading = false;
                state.products = action.payload;
            })
            .addCase(fetchProducts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // fetchProductById
            .addCase(fetchProductById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchProductById.fulfilled, (state, action: PayloadAction<Product>) => {
                state.loading = false;
                state.selectedProduct = action.payload;
            })
            .addCase(fetchProductById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // createProduct
            .addCase(createProduct.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createProduct.fulfilled, (state, action: PayloadAction<Product>) => {
                state.loading = false;
                state.products.unshift(action.payload); // thêm vào đầu danh sách
            })
            .addCase(createProduct.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // updateProduct
            .addCase(updateProduct.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateProduct.fulfilled, (state, action: PayloadAction<Product>) => {
                state.loading = false;
                const index = state.products.findIndex(p => p.docId === action.payload.docId);
                if (index !== -1) {
                    state.products[index] = action.payload;
                }
                state.selectedProduct = action.payload;
            })
            .addCase(updateProduct.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // deleteProduct
            .addCase(deleteProduct.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteProduct.fulfilled, (state, action: PayloadAction<string>) => {
                state.loading = false;
                state.products = state.products.filter(p => p.docId !== action.payload);
                if (state.selectedProduct?.docId === action.payload) {
                    state.selectedProduct = null;
                }
            })
            .addCase(deleteProduct.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { clearSelectedProduct, clearError } = productSlice.actions;
export default productSlice.reducer;