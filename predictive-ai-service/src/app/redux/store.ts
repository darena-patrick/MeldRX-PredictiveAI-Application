import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import conditionsReducer from "./conditionSlice"; 
import observationsReducer from "./observationsSlice";
import documentsReducer from './documentSlice';


export const store = configureStore({
  reducer: {
    auth: authReducer,
    conditions: conditionsReducer,
    observations: observationsReducer,
    documents: documentsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;