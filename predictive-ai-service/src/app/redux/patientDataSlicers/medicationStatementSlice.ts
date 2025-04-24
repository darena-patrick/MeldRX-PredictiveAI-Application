import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface MedicationStatement {
  id: string;
  fullUrl?: string;
  resource: any;
}

interface MedicationStatementState {
    medicationStatements: MedicationStatement[];
}

const initialState: MedicationStatementState = {
    medicationStatements: [],
};

const medicationStatementSlice = createSlice({
  name: "medicationStatements",
  initialState,
  reducers: {
    setMedicationStatements: (state, action: PayloadAction<MedicationStatement[]>) => {
      state.medicationStatements = action.payload;
    },
  },
});

export const { setMedicationStatements } = medicationStatementSlice.actions;
export default medicationStatementSlice.reducer;
