import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Provenance {
  id: string;
  fullUrl?: string;
  resource: any;
}

interface ProvenanceState {
    provenances: Provenance[];
}

const initialState: ProvenanceState = {
    provenances: [],
};

const ProvenanceSlice = createSlice({
  name: "provenances",
  initialState,
  reducers: {
    setProvenances: (state, action: PayloadAction<Provenance[]>) => {
      state.provenances = action.payload;
    },
  },
});

export const { setProvenances } = ProvenanceSlice.actions;
export default ProvenanceSlice.reducer;
