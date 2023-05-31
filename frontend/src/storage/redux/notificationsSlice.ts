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
  socket: string | null;
}

const initialState: NotificationsState = {
  notifications: [],
  socket: null,
};

const appSlice = createSlice({
  name: "notification",
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<Notification>) => {
      if (!state.notifications) state.notifications = [];
      const notification = state.notifications.find(
        (n) => n.id === action.payload.id
      );
      if (action.payload) {
        if (notification) {
          notification.seen = action.payload.seen;
        } else {
          state.notifications.push(action.payload);
        }
      }
    },
    setNotifications: (state, action: PayloadAction<Notification[]>) => {
      if (action.payload) state.notifications = action.payload;
      else state.notifications = [];
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
      if (notification) {
        notification.seen = true;
      }
    },
    markAllNotificationsAsSeen: (state) => {
      state.notifications.forEach((notification) => {
        notification.seen = true;
      });
    },
    setSocket: (state, action: PayloadAction<string | null>) => {
      state.socket = action.payload;
    },
  },
});

export const {
  addNotification,
  removeNotification,
  removeAllNotifications,
  setNotifications,
  markNotificationAsSeen,
  markAllNotificationsAsSeen,
  setSocket,
} = appSlice.actions;

export default appSlice.reducer;
