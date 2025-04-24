import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Goal {
  id: string;
  fullUrl?: string;
  resource: any;
}

interface GoalState {
    goals: Goal[];
}

const initialState: GoalState = {
    goals: [],
};

const goalSlice = createSlice({
  name: "goals",
  initialState,
  reducers: {
    setGoals: (state, action: PayloadAction<Goal[]>) => {
      state.goals = action.payload;
    },
  },
});

export const { setGoals } = goalSlice.actions;
export default goalSlice.reducer;
