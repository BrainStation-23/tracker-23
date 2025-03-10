import { configureStore } from "@reduxjs/toolkit";

import integrationsReducer from "./integrationsSlice";
import notificationsReducer from "./notificationsSlice";
import priorityReducer from "./prioritySlice";
import projectsReducer from "./projectsSlice";
import reportsReducer from "./reportsSlice";
import settingsReducer from "./settingsSlice";
import syncReducer from "./syncSlice";
import tasksReducer from "./tasksSlice";
import userReducer from "./userSlice";
import workspacesReducer from "./workspacesSlice";

export const store = configureStore({
  reducer: {
    syncStatus: syncReducer,
    projectList: projectsReducer,
    integrations: integrationsReducer,
    notificationsSlice: notificationsReducer,
    tasksSlice: tasksReducer,
    userSlice: userReducer,
    workspacesSlice: workspacesReducer,
    settingsSlice: settingsReducer,
    prioritySlice: priorityReducer,
    reportsSlice: reportsReducer,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
