import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import conditionsReducer from "./conditionSlice"; 
import observationsReducer from "./observationsSlice";


export const store = configureStore({
  reducer: {
    auth: authReducer,
    conditions: conditionsReducer,
    observations: observationsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;