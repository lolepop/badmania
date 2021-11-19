import { configureStore } from '@reduxjs/toolkit'
import files from './fileSlice';

const store = configureStore({
    reducer: {
        files
    },
    middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
        serializableCheck: false
    }),

});

export default store;
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
