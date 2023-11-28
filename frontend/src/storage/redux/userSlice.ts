import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { UserDto } from "models/user";

interface UserSliceState {
  user?: UserDto;
}

// Define the initial state using the User interface
const initialState: UserSliceState = {
  user: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUserSlice: (state, action: PayloadAction<UserDto>) => {
      state.user = action.payload;
    },
    resetUserSlice: (state) => {
      state.user = null;
    },
    changeUserRoleSlice: (state, action: PayloadAction<string>) => {
      state.user.role = action.payload;
    },
  },
});

export const { setUserSlice, resetUserSlice, changeUserRoleSlice } =
  userSlice.actions;

export default userSlice.reducer;
