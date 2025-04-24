import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Procedure {
  id: string;
  fullUrl?: string;
  resource: any;
}

interface ProcedureState {
    procedures: Procedure[];
}

const initialState: ProcedureState = {
    procedures: [],
};

const procedureSlice = createSlice({
  name: "procedures",
  initialState,
  reducers: {
    setProcedures: (state, action: PayloadAction<Procedure[]>) => {
      state.procedures = action.payload;
    },
  },
});

export const { setProcedures } = procedureSlice.actions;
export default procedureSlice.reducer;
