import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Immunization {
  id: string;
  fullUrl?: string;
  resource: any;
}

interface ImmunizationState {
    immunizations: Immunization[];
}

const initialState: ImmunizationState = {
    immunizations: [],
};

const immunizationSlice = createSlice({
  name: "immunizations",
  initialState,
  reducers: {
    setImmunizations: (state, action: PayloadAction<Immunization[]>) => {
      state.immunizations = action.payload;
    },
  },
});

export const { setImmunizations } = immunizationSlice.actions;
export default immunizationSlice.reducer;
