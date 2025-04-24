import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface PractitionerRole {
  id: string;
  fullUrl?: string;
  resource: any;
}

interface PractitionerRoleState {
    practitionerRoles: PractitionerRole[];
}

const initialState: PractitionerRoleState = {
    practitionerRoles: [],
};

const practitionerRoleSlice = createSlice({
  name: "practitionerRoles",
  initialState,
  reducers: {
    setPractitionerRoles: (state, action: PayloadAction<PractitionerRole[]>) => {
      state.practitionerRoles = action.payload;
    },
  },
});

export const { setPractitionerRoles } = practitionerRoleSlice.actions;
export default practitionerRoleSlice.reducer;
