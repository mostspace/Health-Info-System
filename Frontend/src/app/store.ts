// store.ts
import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import userReducer from '../features/users/userSlice';
import { usersAPI } from '../features/users/usersAPI';
import { programAPI } from '../features/healthPrograms/programAPI';
import { enrollmentApi } from '../features/enrollment/enrollmentAPI';

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['user']
};

const persistedReducer = persistReducer(persistConfig, userReducer);

export const store = configureStore({
  reducer: {
    user: persistedReducer,
    [usersAPI.reducerPath]: usersAPI.reducer,
    [programAPI.reducerPath]: programAPI.reducer,
    [enrollmentApi.reducerPath]: enrollmentApi.reducer
    
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(usersAPI.middleware, programAPI.middleware)
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
