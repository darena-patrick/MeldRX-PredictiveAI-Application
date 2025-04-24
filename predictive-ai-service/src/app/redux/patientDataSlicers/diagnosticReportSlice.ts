import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface DiagnosticReport {
  id: string;
  fullUrl?: string;
  resource: any;
}

interface DiagnosticReportState {
    diagnosticReports: DiagnosticReport[];
}

const initialState: DiagnosticReportState = {
    diagnosticReports: [],
};

const diagnosticReportSlice = createSlice({
  name: "diagnosticReports",
  initialState,
  reducers: {
    setDiagnosticReports: (state, action: PayloadAction<DiagnosticReport[]>) => {
      state.diagnosticReports = action.payload;
    },
  },
});

export const { setDiagnosticReports } = diagnosticReportSlice.actions;
export default diagnosticReportSlice.reducer;
