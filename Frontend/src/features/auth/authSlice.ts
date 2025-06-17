import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from '../../types/types';

interface AuthState {
    user: (User & { token?: string }) | null;
    isAuthenticated: boolean;
    loading: boolean;
}

const initialState: AuthState = {
    user: null,
    isAuthenticated: false,
    loading: true,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setUser: (state, action: PayloadAction<User | null>) => {
            state.user = action.payload;
            state.isAuthenticated = !!action.payload;
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
        logout: (state) => {
            state.user = null;
            state.isAuthenticated = false;
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        },
    },
});

export const { setUser, setLoading, logout } = authSlice.actions;
export default authSlice.reducer; 