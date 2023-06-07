import { configureStore } from "@reduxjs/toolkit";
import syncReducer from "./syncSlice";
import projectsReducer from "./projectsSlice";
import integrationsReducer from "./integrationsSlice";
import notificationsReducer from "./notificationsSlice";
import tasksReducer from "./tasksSlice";
// ...

export const store = configureStore({
  reducer: {
    syncStatus: syncReducer,
    projectList: projectsReducer,
    integrations: integrationsReducer,
    notificationsSlice: notificationsReducer,
    tasksSlice: tasksReducer,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
