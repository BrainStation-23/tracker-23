import { LoginResponseDto } from "models/auth";
import { config } from "config";
import io from "socket.io-client";
import { getLocalStorage } from "@/storage/storage";
import { store } from "@/storage/redux/store";
import { addNotification, setSocket } from "@/storage/redux/notificationsSlice";
import { GetCookie } from "./cookie.service";

const socket = io(config?.baseUrl, {
  extraHeaders: {
    cookie: GetCookie("access_token") || null,
  },
  withCredentials: true,
});

export async function initializeSocket() {
  socket.on("connect", () => {
    console.log("Connected to socket");
    store.dispatch(setSocket(socket.id));
  });
  socket.on("error", () => {
    // console.log("Error");
  });
  socket.on("onNotification", (payload) => {
    console.log("Received new notification:", payload);
    store.dispatch(addNotification(payload));
  });
  const loggedInUser: LoginResponseDto = getLocalStorage("userDetails");
  socket.on(`${loggedInUser.id}`, (payload) => {
    console.log("Received new notification line 26:", payload);
    store.dispatch(addNotification(payload));
  });
}

export async function disconnectSocket() {
  // console.log("off");
  socket.disconnect();
}
