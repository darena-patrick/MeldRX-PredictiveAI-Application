import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Patient {
  id: string;
  fullUrl?: string;
  resource: any;
}

interface PatientState {
    patients: Patient[];
}

const initialState: PatientState = {
    patients: [],
};

const patientSlice = createSlice({
  name: "patients",
  initialState,
  reducers: {
    setPatients: (state, action: PayloadAction<Patient[]>) => {
      state.patients = action.payload;
    },
  },
});

export const { setPatients } = patientSlice.actions;
export default patientSlice.reducer;
