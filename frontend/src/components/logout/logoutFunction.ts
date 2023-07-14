import { RemoveAllCookies } from "@/services/cookie.service";
import { resetIntegrationsSlice } from "@/storage/redux/integrationsSlice";
import { setSocket } from "@/storage/redux/notificationsSlice";
import { resetProjectsSlice } from "@/storage/redux/projectsSlice";
import { store } from "@/storage/redux/store";
import { userAPI } from "APIs";

export const logOutFunction = async () => {
  store.dispatch(resetIntegrationsSlice());
  store.dispatch(resetProjectsSlice());
  store.dispatch(setSocket(null));
  RemoveAllCookies();
  console.log("logging out");
  userAPI.logout();
};
