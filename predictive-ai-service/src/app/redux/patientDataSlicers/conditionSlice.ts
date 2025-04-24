import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Condition {
    id: string;
    fullUrl: string;
    resource: any;
}

interface ConditionsState {
    conditions: Condition[];
}

const initialState: ConditionsState = {
    conditions: [],
};

const conditionsSlice = createSlice({
    name: "conditions",
    initialState,
    reducers: {
        setConditions: (state, action: PayloadAction<Condition[]>) => {
            state.conditions = action.payload;
        },
    },
});

export const { setConditions } = conditionsSlice.actions;
export default conditionsSlice.reducer;