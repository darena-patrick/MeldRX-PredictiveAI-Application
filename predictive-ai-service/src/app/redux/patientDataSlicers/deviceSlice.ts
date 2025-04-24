import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Device {
  id: string;
  fullUrl?: string;
  resource: any;
}

interface DeviceState {
   devices: Device[];
}

const initialState: DeviceState = {
   devices: [],
};

const deviceSlice = createSlice({
  name: "devices",
  initialState,
  reducers: {
    setDevices: (state, action: PayloadAction<Device[]>) => {
      state.devices = action.payload;
    },
  },
});

export const { setDevices } = deviceSlice.actions;
export default deviceSlice.reducer;
