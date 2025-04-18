import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Analysis {
  documentId: string;
  result: string;
}

interface AnalysisState {
  results: Analysis[];
}

const initialState: AnalysisState = {
  results: [],
};

const analysisSlice = createSlice({
  name: "analysis",
  initialState,
  reducers: {
    addAnalysis: (state, action: PayloadAction<Analysis>) => {
      state.results.push(action.payload);
    },
    clearAnalyses: (state) => {
      state.results = [];
    },
  },
});

export const { addAnalysis, clearAnalyses } = analysisSlice.actions;
export default analysisSlice.reducer;
