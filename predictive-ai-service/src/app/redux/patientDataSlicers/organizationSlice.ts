import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Organization {
  id: string;
  fullUrl?: string;
  resource: any;
}

interface OrganizationState {
    organizations: Organization[];
}

const initialState: OrganizationState = {
    organizations: [],
};

const organizationSlice = createSlice({
  name: "organizations",
  initialState,
  reducers: {
    setOrganizations: (state, action: PayloadAction<Organization[]>) => {
      state.organizations = action.payload;
    },
  },
});

export const { setOrganizations } = organizationSlice.actions;
export default organizationSlice.reducer;
