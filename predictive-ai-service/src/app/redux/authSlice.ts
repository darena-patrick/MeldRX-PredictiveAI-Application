import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  user: any;
  token: string;
  patientId: string | null;
}

const initialState: AuthState = {
  user: null,
  token: '',
  patientId: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<any>) => {
      state.user = action.payload;
    },
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
    },
    setPatientId: (state, action: PayloadAction<string | null>) => {
      state.patientId = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.token = '';
      state.patientId = null;
    },
  },
});


export const { setUser, setToken, setPatientId, logout } = authSlice.actions;
export default authSlice.reducer;
