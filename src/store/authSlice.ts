import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from '../types/models';

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    loading: boolean;
}

const initialState: AuthState = {
    user: null,
    isAuthenticated: false,
    loading: true, // true để chờ check session lúc load lại trang
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        loginStart: (state) => {
            state.loading = true;
        },
        loginSuccess: (state, action: PayloadAction<User>) => {
            state.user = action.payload;
            state.isAuthenticated = true;
            state.loading = false;
        },
        loginFailure: (state) => {
            state.user = null;
            state.isAuthenticated = false;
            state.loading = false;
        },
        logout: (state) => {
            state.user = null;
            state.isAuthenticated = false;
            state.loading = false;
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
    },
});

export const { loginStart, loginSuccess, loginFailure, logout, setLoading } = authSlice.actions;
export default authSlice.reducer;