import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Document {
  id: string;
  fullUrl: string;
  resource: any;
}

interface DocumentsState {
  documents: Document[];
}

const initialState: DocumentsState = {
  documents: [],
};

const documentsSlice = createSlice({
  name: "documents",
  initialState,
  reducers: {
    setDocuments: (state, action: PayloadAction<Document[]>) => {
      state.documents = action.payload;
    },
  },
});

export const { setDocuments } = documentsSlice.actions;
export default documentsSlice.reducer;
