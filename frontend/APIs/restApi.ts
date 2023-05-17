import { message } from "antd";
import axios from "axios";
import { SearchParamsModel } from "models/apiParams";
import { LoginDto, LoginResponseDto, RegisterDto } from "models/auth";
import {
  AddWorkLogParams,
  CreateTaskDto,
  UpdateTaskStatusParams,
} from "models/tasks";
import Router from "next/router";
import { apiEndPoints } from "utils/apiEndPoints";

import { GetCookie, RemoveCookie, SetCookie } from "@/services/cookie.service";
import { getStringFromArray } from "@/services/taskActions";
import { clearLocalStorage, setLocalStorage } from "@/storage/storage";

import { sortByStatus } from "../src/services/taskActions";

export async function loginRest(
  data: LoginDto
): Promise<LoginResponseDto | undefined> {
  console.log("🚀 ~ file: restApi.ts:19 ~ logInRest ~ data", data);
  try {
    console.log(">>", axios.defaults.baseURL);

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
    console.log(">>", axios.defaults.baseURL);

    const res = await axios.post(`${apiEndPoints.googleLogin}?code=${code}`);
    console.log("🚀 ~ file: restApi.ts:45 ~ res:", res);
    return res.data;
  } catch (error: any) {
    return error;
  }
}

export async function registerRest(
  data: RegisterDto
): Promise<RegisterDto | undefined> {
  console.log("🚀 ~ file: restApi.ts:19 ~ logInRest ~ data", data);
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
    // console.log(res);

    return res.data;
  } catch (error: any) {
    return false;
  }
}

export async function deleteTaskRest(taskId: any) {
  try {
    const res = await axios.delete(`${apiEndPoints.tasks}/${taskId}`);
    // console.log(res);
    message.success("Task Deleted");
    return true;
  } catch (error: any) {
    return false;
  }
}

export async function getTasksRest(searchParams: SearchParamsModel) {
  const status = getStringFromArray(searchParams?.status);
  const priority = getStringFromArray(searchParams?.priority);
  try {
    const res = await axios.get(
      apiEndPoints.tasks +
        "?" +
        (searchParams?.selectedDate?.length === 2
          ? `startDate=${searchParams?.selectedDate[0]}&endDate=${searchParams?.selectedDate[1]}`
          : "") +
        (searchParams?.searchText && searchParams?.searchText.length > 0
          ? `&text=${searchParams.searchText}`
          : "") +
        (priority && priority.length > 0 ? `&priority=${priority}` : "") +
        (status && status.length > 0 ? `&status=${status}` : "")
    );
    const sortedTasks = sortByStatus(res.data);
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
  const priority = getStringFromArray(searchParams?.priority);
  try {
    const res = await axios.get(
      apiEndPoints.export +
        "?" +
        (searchParams?.selectedDate?.length === 2
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
    console.log("🚀 ~ file: restApi.ts:167 ~ exportTasksRest ~ res:", res);
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
  console.log("🚀 ~ file: restApi.ts:91 ~ createSessionRest ~ taskID", taskId);

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
  console.log("🚀 ~ file: restApi.ts:91 ~ stopSessionRest ~ taskID", taskId);

  try {
    const res = await axios.post(`${apiEndPoints.sessions}/${taskId}`, {});
    return res.data;
  } catch (error: any) {
    console.log("🚀 ~ file: restApi.ts:241 ~ stopSessionRest ~ error:", error);

    return false;
  }
}

export async function authJiraRest() {
  try {
    const res = await axios.get(`${apiEndPoints.jira}`);
    console.log("🚀 ~ file: restApi.ts:160 ~ authJiraRest ~ res:", res);
    return res.data;
  } catch (error: any) {
    return false;
  }
}

export async function getJiraLinkRest() {
  try {
    const res = await axios.get(`${apiEndPoints.jira}`);
    console.log("🚀 ~ file: restApi.ts:160 ~ authJiraRest ~ res:", res);
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
    console.log("deleteIntegrationRest", res);
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
    console.log("getIntegrationsRest", res);
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
      data
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
