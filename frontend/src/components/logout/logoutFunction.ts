import { userAPI } from "APIs";

import { RemoveAllCookies } from "@/services/cookie.service";
import { resetIntegrationsSlice } from "@/storage/redux/integrationsSlice";
import {
  resetNotificationSlice,
  setSocket,
} from "@/storage/redux/notificationsSlice";
import { resetProjectsSlice } from "@/storage/redux/projectsSlice";
import { resetSettingsReducer } from "@/storage/redux/settingsSlice";
import { store } from "@/storage/redux/store";
import { resetUserSlice } from "@/storage/redux/userSlice";
import { resetWorkspacesSlice } from "@/storage/redux/workspacesSlice";
import { clearLocalStorage } from "@/storage/storage";

export const logOutFunction = async () => {
  store.dispatch(resetIntegrationsSlice());
  store.dispatch(resetProjectsSlice());
  store.dispatch(resetWorkspacesSlice());
  store.dispatch(resetUserSlice());
  store.dispatch(resetNotificationSlice());
  store.dispatch(resetSettingsReducer());
  store.dispatch(setSocket(null));
  RemoveAllCookies();
  clearLocalStorage();
  console.log("logging out");
  userAPI.logout();
};
