import { message } from "antd";
import axios from "axios";
import { SearchParamsModel } from "models/apiParams";
import { LoginDto, LoginResponseDto, RegisterDto } from "models/auth";
import {
  AddWorkLogParams,
  CreateTaskDto,
  UpdateTaskEstimationParams,
  UpdateTaskStatusParams,
} from "models/tasks";
import Router from "next/router";
import { apiEndPoints } from "utils/apiEndPoints";

import { GetCookie, RemoveCookie, SetCookie } from "@/services/cookie.service";
import {
  getFormattedTasks,
  getLabels,
  getStringFromArray,
} from "@/services/taskActions";
import { clearLocalStorage, setLocalStorage } from "@/storage/storage";

import { sortByStatus } from "../src/services/taskActions";
import { setTasksSliceHook } from "@/hooks/taskHooks";

export async function loginRest(
  data: LoginDto
): Promise<LoginResponseDto | undefined> {
  try {
    const res = await axios.post(`${apiEndPoints.login}`, data);
    if (res?.data?.access_token) {
      SetCookie("access_token", res?.data?.access_token);
      setLocalStorage("access_token", res?.data?.access_token);
      setLocalStorage("userDetails", res.data);
    }
    return res.data;
  } catch (error: any) {
    return error;
  }
}

export async function googleLoginRest(
  code: string
): Promise<LoginResponseDto | undefined> {
  try {
    const res = await axios.post(`${apiEndPoints.googleLogin}?code=${code}`);
    return res.data;
  } catch (error: any) {
    return error;
  }
}

export async function registerRest(
  data: RegisterDto
): Promise<RegisterDto | undefined> {
  try {
    const res = await axios.post(`${apiEndPoints.register}`, data);
    return res.data;
  } catch (error: any) {
    return error;
  }
}

export async function logoutRest() {
  try {
    RemoveCookie("access_token");
    clearLocalStorage();
    // deleteFromLocalStorage("userDetails");
    message.success("Logged Out");
    Router.push("/login");
    return true;
  } catch (error: any) {
    message.error("Failed to Log Out");
    return false;
  }
}

export async function createTaskRest(data: CreateTaskDto) {
  try {
    const res = await axios.post(`${apiEndPoints.tasks}`, data);
    return res.data;
  } catch (error: any) {
    return false;
  }
}

export async function deleteTaskRest(taskId: any) {
  try {
    const res = await axios.delete(`${apiEndPoints.tasks}/${taskId}`);
    message.success("Task Deleted");
    return true;
  } catch (error: any) {
    return false;
  }
}

export async function getTasksRest(searchParams: SearchParamsModel) {
  const sprints = searchParams?.sprints;
  const status = getStringFromArray(getLabels(searchParams?.status));
  const priority = getStringFromArray(searchParams?.priority);
  try {
    const res = await axios.get(
      apiEndPoints.tasks +
        "?" +
        (sprints?.length > 0
          ? `sprintId=${sprints}`
          : searchParams?.selectedDate?.length === 2
          ? `startDate=${searchParams?.selectedDate[0]}&endDate=${searchParams?.selectedDate[1]}`
          : "") +
        (searchParams?.searchText && searchParams?.searchText.length > 0
          ? `&text=${searchParams.searchText}`
          : "") +
        (priority && priority.length > 0 ? `&priority=${priority}` : "") +
        (status && status.length > 0 ? `&status=${status}` : "")
    );
    const sortedTasks = sortByStatus(res.data);
    // const sortedTasks = sortByStatus(getFormattedTasks(res.data));
    // setTasksSliceHook(sortedTasks);
    return sortedTasks;
  } catch (error: any) {
    // if (error?.response?.status === 401) {
    //   await logoutRest();
    // }

    return false;
  }
}

export async function exportTasksRest(searchParams: SearchParamsModel) {
  const status = getStringFromArray(searchParams?.status);
  const sprints = searchParams?.sprints;
  const priority = getStringFromArray(searchParams?.priority);
  try {
    const res = await axios.get(
      apiEndPoints.export +
        "?" +
        (sprints?.length > 0
          ? `sprintId=${sprints}`
          : searchParams?.selectedDate?.length === 2
          ? `startDate=${searchParams?.selectedDate[0]}&endDate=${searchParams?.selectedDate[1]}`
          : "") +
        (searchParams?.searchText && searchParams?.searchText.length > 0
          ? `&text=${searchParams.searchText}`
          : "") +
        (priority && priority.length > 0 ? `&priority=${priority}` : "") +
        (status && status.length > 0 ? `&status=${status}` : ""),
      {
        responseType: "blob", // Set responseType to 'blob' to receive binary data
      }
    );
    return res.data;
  } catch (error: any) {
    return false;
  }
}

export async function syncStatusRest() {
  try {
    const res = await axios.get(`${apiEndPoints.syncStatus}`);
    return res.data;
  } catch (error: any) {
    return false;
  }
}

export async function syncTasksRest() {
  try {
    const res = await axios.get(`${apiEndPoints.syncTasks}`);
    return res.data;
  } catch (error: any) {
    return false;
  }
}

export async function createSessionRest(taskId: string) {
  try {
    const res = await axios.post(`${apiEndPoints.sessions}`, {
      taskId: taskId,
    });
    return res.data;
  } catch (error: any) {
    return false;
  }
}

export async function stopSessionRest(taskId: string) {
  try {
    const res = await axios.post(`${apiEndPoints.sessions}/${taskId}`, {});
    return res.data;
  } catch (error: any) {
    return false;
  }
}

export async function authJiraRest() {
  try {
    const res = await axios.get(`${apiEndPoints.jira}`);
    return res.data;
  } catch (error: any) {
    return false;
  }
}

export async function getJiraLinkRest() {
  try {
    const res = await axios.get(`${apiEndPoints.jira}`);
    return res.data;
  } catch (error: any) {
    return false;
  }
}

export async function sendJiraCodeRest(code: string) {
  try {
    const res = await axios.post(`${apiEndPoints.authJira}`, { code: code });
    return res.data;
  } catch (error: any) {
    return false;
  }
}

export async function deleteIntegrationRest(id: number) {
  try {
    const res = await axios.delete(`${apiEndPoints.integrations}/${id}`);
    message.success(res?.data?.message);
    return true;
  } catch (error: any) {
    return false;
  }
}

export async function selectJiraIntegrationRest(id: string) {
  try {
    const res = await axios.post(`${apiEndPoints.jira}/${id}`);
    message.success(res?.data?.message);
    return true;
  } catch (error: any) {
    return false;
  }
}

export async function getIntegrationsRest() {
  try {
    const res = await axios.get(`${apiEndPoints.integrations}`);
    return res.data;
  } catch (error: any) {
    return false;
  }
}
export async function getProjectWiseHourRest(dates?: any) {
  try {
    const res = await axios.get(
      `${apiEndPoints.spentTime}?${
        dates?.length > 0
          ? `startDate=${dates[0]}&endDate=${dates[1]}`
          : `startDate=Apr 01, 2022&endDate=Apr 09 , 2023`
      }`
    );
    return res.data;
  } catch (error: any) {
    return false;
  }
}

export async function getSpentTimePerDayRest(dates?: any) {
  try {
    const res = await axios.get(
      `${apiEndPoints.spentTimePerDay}?${
        dates?.length > 0
          ? `startDate=${dates[0]}&endDate=${dates[1]}`
          : `startDate=Apr 01, 2022&endDate=Apr 09 , 2023`
      }`
    );
    return res.data;
  } catch (error: any) {
    return false;
  }
}

export async function addManualWorkLogRest(data: AddWorkLogParams) {
  try {
    const res = await axios.patch(`${apiEndPoints.addWorkLog}`, data);
    return res.data;
  } catch (error: any) {
    return false;
  }
}

export async function updateTaskSTatusRest(
  taskId: any,
  data: UpdateTaskStatusParams
) {
  try {
    const res = await axios.patch(
      `${apiEndPoints.updateTaskStatus}/${taskId}`,
      { status: data.status.name }
    );
    return res.data;
  } catch (error: any) {
    return false;
  }
}

export async function updateTaskEstimationRest(
  taskId: any,
  data: UpdateTaskEstimationParams
) {
  try {
    const res = await axios.patch(
      `${apiEndPoints.updateTaskEstimation}/${taskId}`,
      { estimation: data.estimation }
    );
    return res.data;
  } catch (error: any) {
    return false;
  }
}
export async function pinTaskRest(taskId: any, pinned: boolean) {
  try {
    const res = await axios.patch(`${apiEndPoints.tasks}/${taskId}`, {
      pinned: pinned,
    });
    return res.data;
  } catch (error: any) {
    return false;
  }
}

export async function getProjectWiseStatusRest() {
  try {
    const res = await axios.get(`${apiEndPoints.projectWiseStatus}`);
    return res.data;
  } catch (error: any) {
    return false;
  }
}

export async function getNotificationsRest() {
  try {
    const res = await axios.get(`${apiEndPoints.notifications}`);
    return res.data;
  } catch (error: any) {
    return false;
  }
}

export async function markNotificationSeenRest(id: number) {
  try {
    const res = await axios.patch(`${apiEndPoints.markNotificationSeen}${id}`);
    return res.data;
  } catch (error: any) {
    return false;
  }
}

export async function markAllNotificationsSeenRest() {
  try {
    const res = await axios.patch(`${apiEndPoints.markAllNotificationsSeen}`);
    return res.data;
  } catch (error: any) {
    return false;
  }
}

export async function deleteSessionRest(sessionId: number) {
  try {
    const res = await axios.delete(`${apiEndPoints.deleteSession}${sessionId}`);
    return res.data;
  } catch (error: any) {
    return false;
  }
}

export async function updateSessionRest(
  sessionId: number,
  data: AddWorkLogParams
) {
  try {
    const res = await axios.patch(
      `${apiEndPoints.updateSession}${sessionId}`,
      data
    );
    return res.data;
  } catch (error: any) {
    return false;
  }
}

export async function getJiraSprintsRest() {
  try {
    const res = await axios.get(`${apiEndPoints.jiraSprints}`);
    return res.data;
  } catch (error: any) {
    return false;
  }
}

export async function getJiraActiveSprintTasksRest(
  searchParams: SearchParamsModel
) {
  const status = getStringFromArray(getLabels(searchParams?.status));
  const priority = getStringFromArray(searchParams?.priority);
  try {
    const res = await axios.get(
      `${apiEndPoints.activeSprintTasks}/?state=${["active"]}` +
        (searchParams?.searchText && searchParams?.searchText.length > 0
          ? `&text=${searchParams.searchText}`
          : "") +
        (priority && priority.length > 0 ? `&priority=${priority}` : "") +
        (status && status.length > 0 ? `&status=${status}` : "")
      // `${apiEndPoints.activeSprintTasks}/?state=${["closed"]}`
    );
    return res.data;
  } catch (error: any) {
    return false;
  }
}

export async function getAllProjectsRest() {
  try {
    const res = await axios.get(`${apiEndPoints.allProjects}`);
    return res.data;
  } catch (error: any) {
    return false;
  }
}

export async function getProjectTasksRest(id: number) {
  try {
    const res = await axios.get(`${apiEndPoints.projectTasks}/${id}`);
    return res.data;
  } catch (error: any) {
    return false;
  }
}
export async function deleteProjectTasksRest(id: number) {
  try {
    const res = await axios.post(`${apiEndPoints.projectTasks}/${id}`);
    return res.data;
  } catch (error: any) {
    return false;
  }
}
