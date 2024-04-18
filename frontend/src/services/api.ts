import axios from "axios";
import { message } from "antd";
import { config } from "config";
import { getLocalStorage } from "@/storage/storage";
import { logOutFunction } from "@/components/logout/logoutFunction";

import { store } from "@/storage/redux/store";
import { setAuthorizationSlice } from "@/storage/redux/integrationsSlice";
import { AuthorizationErrorMessage } from "models/integration";

const baseURL = config?.baseUrl;
const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});
api.interceptors.request.use(
  (config) => {
    const token = getLocalStorage("access_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(undefined, async (error) => {
  const { status, data } = error.response;
  if (!error.response) {
    message.error("Backend Crashed");
  }
  if (data?.error?.message)
    message.error(
      data?.error?.message ? data?.error?.message : "Something Went Wrong"
    );
  if (status === 401) {
    logOutFunction();
  }
  if (status === 410 && data.error.message) {
    switch (data.error.message) {
      case AuthorizationErrorMessage.INVALID_JIRA_REFRESH_TOKEN:
        store.dispatch(setAuthorizationSlice({ type: "JIRA", value: true }));
        break;
      case AuthorizationErrorMessage.INVALID_OUTLOOK_REFRESH_TOKEN:
        store.dispatch(setAuthorizationSlice({ type: "OUTLOOK", value: true }));
        break;
      default:
        break;
    }
  }

  throw error.response;
});

export default api;
