import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import productReducer from './productSlice';
import couponReducer from './couponSlice';
import staffReducer from './staffSlice';


export const store = configureStore({
    reducer: {
        auth: authReducer,
        product: productReducer,
        coupon: couponReducer,
        staff: staffReducer,

    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;