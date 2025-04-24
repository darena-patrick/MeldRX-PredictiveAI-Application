import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface CareTeam {
  id: string;
  fullUrl?: string;
  resource: any;
}

interface CareTeamState {
   careTeams: CareTeam[];
}

const initialState: CareTeamState = {
  careTeams: [],
};

const careTeamSlice = createSlice({
  name: "careTeams",
  initialState,
  reducers: {
    setCareTeams: (state, action: PayloadAction<CareTeam[]>) => {
      state.careTeams = action.payload;
    },
  },
});

export const { setCareTeams } = careTeamSlice.actions;
export default careTeamSlice.reducer;
