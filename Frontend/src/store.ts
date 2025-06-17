import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { usersAPI } from './features/users/usersAPI';
import { enrollmentApi } from './features/enrollment/enrollmentAPI';
import { programsApi } from './features/programs/programsAPI';
import { programAPI } from './features/healthPrograms/programAPI';
import authReducer from './features/auth/authSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        [usersAPI.reducerPath]: usersAPI.reducer,
        [enrollmentApi.reducerPath]: enrollmentApi.reducer,
        [programsApi.reducerPath]: programsApi.reducer,
        [programAPI.reducerPath]: programAPI.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(
            usersAPI.middleware,
            enrollmentApi.middleware,
            programsApi.middleware,
            programAPI.middleware
        ),
});

setupListeners(store.dispatch);

// Define the root state type
export type RootState = {
    auth: {
        user: any | null;
        isAuthenticated: boolean;
        loading: boolean;
    };
    [usersAPI.reducerPath]: ReturnType<typeof usersAPI.reducer>;
    [enrollmentApi.reducerPath]: ReturnType<typeof enrollmentApi.reducer>;
    [programsApi.reducerPath]: ReturnType<typeof programsApi.reducer>;
    [programAPI.reducerPath]: ReturnType<typeof programAPI.reducer>;
};

export type AppDispatch = typeof store.dispatch; 