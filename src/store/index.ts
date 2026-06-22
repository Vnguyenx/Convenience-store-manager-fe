import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import productReducer from './productSlice';
import couponReducer from './couponSlice';


export const store = configureStore({
    reducer: {
        auth: authReducer,
        product: productReducer,
        coupon: couponReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;