// src/store/allergySlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface CarePlan {
  id: string;
  fullUrl?: string;
  resource: any;
}

interface CarePlanState {
  carePlans: CarePlan[];
}

const initialState: CarePlanState = {
    carePlans: [],
};

const carePlanSlice = createSlice({
  name: "carePlans",
  initialState,
  reducers: {
    setCarePlans: (state, action: PayloadAction<CarePlan[]>) => {
      state.carePlans = action.payload;
    },
  },
});

export const { setCarePlans } = carePlanSlice.actions;
export default carePlanSlice.reducer;
