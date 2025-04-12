import { createSlice, PayloadAction } from "@reduxjs/toolkit";


interface FHIRAttachment {
  contentType?: string;
  data?: string;
  url?: string;
}

interface FHIRContent {
  attachment?: FHIRAttachment;
}

interface DocumentReference {
  resourceType: "DocumentReference";
  id: string;
  content?: FHIRContent[];
  [key: string]: any; // Optional for catching extras like type, subject, etc.
}

interface DocumentsState {
  documents: DocumentReference[];
}

const initialState: DocumentsState = {
  documents: [],
};

const documentsSlice = createSlice({
  name: "documents",
  initialState,
  reducers: {
    setDocuments: (state, action: PayloadAction<DocumentReference[]>) => {
      state.documents = action.payload;
    },
  },
});

export const { setDocuments } = documentsSlice.actions;
export default documentsSlice.reducer;
