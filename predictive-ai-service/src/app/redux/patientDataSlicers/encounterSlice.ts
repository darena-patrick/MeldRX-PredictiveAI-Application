import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Encounter {
  id: string;
  fullUrl?: string;
  resource: any;
}

interface EncounterState {
    encounters: Encounter[];
}

const initialState: EncounterState = {
    encounters: [],
};

const encounterSlice = createSlice({
  name: "encounters",
  initialState,
  reducers: {
    setEncounters: (state, action: PayloadAction<Encounter[]>) => {
      state.encounters = action.payload;
    },
  },
});

export const { setEncounters } = encounterSlice.actions;
export default encounterSlice.reducer;
