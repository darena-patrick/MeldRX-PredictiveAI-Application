import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import conditionsReducer from "./conditionSlice"; 

export const store = configureStore({
  reducer: {
    auth: authReducer,
    conditions: conditionsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;