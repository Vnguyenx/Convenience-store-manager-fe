import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import productReducer from './productSlice';
import couponReducer from './couponSlice';
import staffReducer from './staffSlice';
import myShiftReducer from './myShiftSlice';
import supplierReducer from './supplierSlice';
import inventoryReducer from './inventorySlice';
import purchaseOrderReducer from './purchaseOrderSlice';


export const store = configureStore({
    reducer: {
        auth: authReducer,
        product: productReducer,
        coupon: couponReducer,
        staff: staffReducer,
        myShift: myShiftReducer,
        suppliers: supplierReducer,
        inventory: inventoryReducer,
        purchaseOrders: purchaseOrderReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;