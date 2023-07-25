import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  activeWorkspaceId?: number;
  role?: string;
}
interface UserSliceState {
  user?: User;
}

// Define the initial state using the User interface
const initialState: UserSliceState = {
  user: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUserSlice: (state, action: PayloadAction<User>) => {
      console.log(
        "🚀 ~ file: userSlice.ts:29 ~ action.payload:",
        action.payload
      );
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
