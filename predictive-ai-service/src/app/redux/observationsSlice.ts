import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Observation {
  id: string;
  fullUrl: string;
  resource: any;
}

interface ObservationsState {
  observations: Observation[];
}

const initialState: ObservationsState = {
  observations: [],
};

const observationsSlice = createSlice({
  name: "observations",
  initialState,
  reducers: {
    setObservations: (state, action: PayloadAction<Observation[]>) => {
      state.observations = action.payload;
    },
  },
});

export const { setObservations } = observationsSlice.actions;
export default observationsSlice.reducer;
