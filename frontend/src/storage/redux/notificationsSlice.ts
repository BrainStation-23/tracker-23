import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Notification {
  id: number;
  createdAt: Date;
  seen: boolean;
  author: string;
  description: string;
}

export interface NotificationsState {
  notifications: Notification[];
}

const initialState: NotificationsState = {
  notifications: [],
};

const appSlice = createSlice({
  name: "notification",
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<Notification>) => {
      if (!state.notifications) state.notifications = [];
      if (action.payload) {
        state.notifications.push(action.payload);
      }
    },
    setNotifications: (state, action: PayloadAction<Notification[]>) => {
      if (action.payload) state.notifications = action.payload;
    },
    removeNotification: (state, action: PayloadAction<number>) => {
      const notificationId = action.payload;
      state.notifications = state.notifications.filter(
        (n) => n.id !== notificationId
      );
    },
    removeAllNotifications: (state) => {
      state.notifications = [];
    },
    markNotificationAsSeen: (state, action: PayloadAction<number>) => {
      const notificationId = Number(action.payload);
      const notification = state.notifications.find(
        (n) => n.id === notificationId
      );
      console.log("🚀 ~ file: notificationsSlice.ts:60 ~ action:", action);
      if (notification) {
        notification.seen = true;
      }
    },
    markAllNotificationsAsSeen: (state) => {
      state.notifications.forEach((notification) => {
        notification.seen = true;
      });
    },
  },
});

export const {
  addNotification,
  removeNotification,
  removeAllNotifications,
  setNotifications,
  markNotificationAsSeen,
} = appSlice.actions;

export default appSlice.reducer;
