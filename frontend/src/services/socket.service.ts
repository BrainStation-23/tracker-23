import { LoginResponseDto } from "models/auth";
import { config } from "config";
import io from "socket.io-client";
import { GetCookie } from "./cookie.service";
import { getLocalStorage } from "@/storage/storage";
import { store } from "@/storage/redux/store";
import { addNotification, setSocket } from "@/storage/redux/notificationsSlice";
let socket = io(config?.baseUrl, {
  withCredentials: true,
  // extraHeaders: {
  //   "my-custom-header": "abcd",
  //   // "auth-token": GetCookie("access_token"),
  // },
  // query: { token:  },
}); // Replace with your backend server URL

export async function initializeSocket() {
  socket = io(config?.baseUrl, {
    withCredentials: true,
    // extraHeaders: {
    //   "my-custom-header": "abcd",
    // },
    // query: { token: GetCookie("access_token") },
  }); // Replace with your backend server URL

  socket.on("connect", () => {
    console.log("Connected to socket");
    store.dispatch(setSocket(socket.id));
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
    // if(payload?.title ==='Sync Completed')
    // {

    // }
    store.dispatch(addNotification(payload));
    // Handle the received notification payload in your frontend application
  });
}

export async function disconnectSocket() {
  console.log("off");

  socket.disconnect();
}

export function sendNotification(payload: any) {
  socket.emit("notification", payload);
}
