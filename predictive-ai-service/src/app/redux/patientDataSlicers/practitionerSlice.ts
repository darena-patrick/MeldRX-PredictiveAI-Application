import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Practitioner {
  id: string;
  fullUrl?: string;
  resource: any;
}

interface PractitionerState {
    practitioners: Practitioner[];
}

const initialState: PractitionerState = {
    practitioners: [],
};

const practitionerSlice = createSlice({
  name: "practitioners",
  initialState,
  reducers: {
    setPractitioners: (state, action: PayloadAction<Practitioner[]>) => {
      state.practitioners = action.payload;
    },
  },
});

export const { setPractitioners } = practitionerSlice.actions;
export default practitionerSlice.reducer;
