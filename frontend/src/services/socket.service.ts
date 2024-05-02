import { config } from "config";
import { store } from "@/storage/redux/store";
import io, { Socket } from "socket.io-client";
import { LoginResponseDto } from "models/auth";
import { getLocalStorage } from "@/storage/storage";
import { addNotification, setSocket } from "@/storage/redux/notificationsSlice";

let socket: Socket;

export async function initializeSocket(getCookie: string) {
  socket = io(config?.baseUrl, {
    extraHeaders: {
      Cookie_token: getCookie,
    },
    withCredentials: true,
  });
  socket.on("connect", () => {
    console.log("Connected to socket");
    store.dispatch(setSocket(socket.id));
  });
  socket.on("error", () => {
    console.log("Error");
  });
  socket.on("onNotification", (payload) => {
    store.dispatch(addNotification(payload));
  });
  const loggedInUser: LoginResponseDto = getLocalStorage("userDetails");
  socket.on(`${loggedInUser.id}`, (payload) => {
    console.log("🚀 ~ socket.on ~ payload:",loggedInUser.id, payload);
    store.dispatch(addNotification(payload));
  });
}

export async function disconnectSocket() {
  console.log("Socket disconnected !!");
  socket.disconnect();
}
