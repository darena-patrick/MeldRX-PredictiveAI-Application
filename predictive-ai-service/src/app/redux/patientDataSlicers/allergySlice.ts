// src/store/allergySlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Allergy {
  id: string;
  fullUrl?: string;
  resource: any;
}

interface AllergyState {
  allergies: Allergy[];
}

const initialState: AllergyState = {
  allergies: [],
};

const allergySlice = createSlice({
  name: "allergies",
  initialState,
  reducers: {
    setAllergies: (state, action: PayloadAction<Allergy[]>) => {
      state.allergies = action.payload;
    },
  },
});

export const { setAllergies } = allergySlice.actions;
export default allergySlice.reducer;
