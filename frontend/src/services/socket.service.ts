import { LoginResponseDto } from "models/auth";
import { config } from "config";
import io from "socket.io-client";
import { GetCookie } from "./cookie.service";
import { getLocalStorage } from "@/storage/storage";
import { store } from "@/storage/redux/store";
import { addNotification } from "@/storage/redux/notificationsSlice";

const socket = io(config?.baseUrl, {
  withCredentials: true,
  extraHeaders: {
    "my-custom-header": "abcd",
  },
  query: { token: GetCookie("access_token") },
}); // Replace with your backend server URL

export function initializeSocket() {
  console.log("ok");

  socket.on("connect", () => {
    console.log("Connected to socket");
  });
  socket.on("error", () => {
    console.log("Error");
  });
  socket.on("onNotification", (payload) => {
    console.log("Received new notification:", payload);
    // Handle the received notification payload in your frontend application
  });
  const loggedInUser: LoginResponseDto = getLocalStorage("userDetails");
  socket.on(`${loggedInUser.id}`, (payload) => {
    console.log("Received new notification:", payload);
    store.dispatch(addNotification(payload));
    // Handle the received notification payload in your frontend application
  });
}

export function sendNotification(payload: any) {
  socket.emit("notification", payload);
}
