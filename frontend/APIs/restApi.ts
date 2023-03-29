import { GetCookie, RemoveCookie, SetCookie } from "@/services/cookie.service";
import { LoginDto, LoginResponseDto, RegisterDto } from "models/auth";
import {
  deleteFromLocalStorage,
  getLocalStorage,
  setLocalStorage,
} from "@/storage/storage";

import { CreateTaskDto } from "models/tasks";
import { apiEndPoints } from "utils/apiEndPoints";
import axios from "axios";
import { toast } from "react-toastify";
import { message } from "antd";
import { SearchParamsModel } from "models/apiParams";

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
    toast.error(
      error.response?.data?.message
        ? error.response?.data?.message
        : "Login Failed"
    );
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
    toast.error(
      error.response?.data?.message
        ? error.response?.data?.message
        : "Registration Failed"
    );
    return error;
  }
}

export async function logoutRest() {
  try {
    RemoveCookie("access_token");
    deleteFromLocalStorage("userDetails");
    message.success("Logged Out");
    return true;
  } catch (error: any) {
    toast.error("Failed to Log Out");
    return false;
  }
}

export async function createTaskRest(data: CreateTaskDto) {
  try {
    const res = await axios.post(`${apiEndPoints.tasks}`, data, {
      headers: {
        Authorization: `Bearer ${GetCookie("access_token")}`,
      },
    });
    // console.log(res);

    return res.data;
  } catch (error: any) {
    toast.error("Failed to Create Task : " + error.message);
    return false;
  }
}

export async function deleteTaskRest(taskId: any) {
  try {
    const res = await axios.delete(`${apiEndPoints.tasks}/${taskId}`, {
      headers: {
        Authorization: `Bearer ${GetCookie("access_token")}`,
      },
    });
    // console.log(res);
    toast.success("Task Deleted");
    return true;
  } catch (error: any) {
    toast.error("Failed to Delete Task : " + error.message);
    return false;
  }
}

export async function getTasksRest(searchParams: SearchParamsModel) {
  console.log(
    "🚀 ~ file: restApi.ts:101 ~ getTasksRest ~ searchParams:",
    searchParams
  );
  try {
    // const res = await axios.get(`${apiEndPoints.tasks}`, {
    //   headers: {
    //     Authorization: `Bearer ${GetCookie("access_token")}`,
    //   },
    // });
    const res = await axios.get(
      `${apiEndPoints.tasks}?${
        searchParams?.selectedDate?.length === 2
          ? `startDate=${searchParams?.selectedDate[0]}&endDate=${searchParams?.selectedDate[1]}`
          : ""
      }${
        searchParams?.searchText && searchParams?.searchText.length > 0
          ? `&text=${searchParams.searchText}`
          : ""
      }
      ${
        searchParams?.priority && searchParams?.priority !== "Priority"
          ? `&priority=${searchParams.priority}`
          : ""
      }
      ${
        searchParams?.status && searchParams?.status !== "Status"
          ? `&status=${searchParams?.status}`
          : ""
      }`,
      {
        headers: {
          Authorization: `Bearer ${GetCookie("access_token")}`,
        },
      }
    );
    console.log("getTasksRest", res);
    return res.data;
  } catch (error: any) {
    toast.error("Failed to Get Task : " + error.message);
    return false;
  }
}

export async function syncTasksRest(token?: string) {
  console.log("<><><>", getLocalStorage("access_token"));

  try {
    const res = await axios.get(`${apiEndPoints.syncTasks}`, {
      headers: {
        Authorization: `Bearer ${token ? token : GetCookie("access_token")}`,
      },
    });
    return res.data;
  } catch (error: any) {
    toast.error("Failed to Get Task : " + error.message);
    return false;
  }
}

export async function createSessionRest(taskId: string) {
  console.log("🚀 ~ file: restApi.ts:91 ~ createSessionRest ~ taskID", taskId);
  console.log("<><><>", getLocalStorage("access_token"));

  try {
    const res = await axios.post(
      `${apiEndPoints.sessions}`,
      { taskId: taskId },
      {
        headers: {
          Authorization: `Bearer ${GetCookie("access_token")}`,
        },
      }
    );
    console.log("getTasksRest", res);
    return res.data;
  } catch (error: any) {
    toast.error("Failed to Get Task : " + error.message);
    return false;
  }
}

export async function stopSessionRest(taskId: string) {
  console.log("🚀 ~ file: restApi.ts:91 ~ stopSessionRest ~ taskID", taskId);
  console.log(
    "<><><>",
    getLocalStorage("access_token"),
    GetCookie("access_token")
  );

  try {
    const res = await axios.post(
      `${apiEndPoints.sessions}/${taskId}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${GetCookie("access_token")}`,
        },
      }
    );
    console.log("getTasksRest", res);
    return res.data;
  } catch (error: any) {
    toast.error("Failed to Get Task : " + error.message);
    return false;
  }
}

export async function authJiraRest() {
  try {
    const res = await axios.get(`${apiEndPoints.jira}`, {
      headers: {
        Authorization: `Bearer ${GetCookie("access_token")}`,
      },
    });
    console.log("🚀 ~ file: restApi.ts:160 ~ authJiraRest ~ res:", res);
    return res.data;
  } catch (error: any) {
    toast.error("Failed to Jira Auth : " + error.message);
    return false;
  }
}

export async function getJiraLinkRest() {
  try {
    const res = await axios.get(`${apiEndPoints.jira}`, {
      headers: {
        Authorization: `Bearer ${GetCookie("access_token")}`,
      },
    });
    console.log("🚀 ~ file: restApi.ts:160 ~ authJiraRest ~ res:", res);
    return res.data;
  } catch (error: any) {
    toast.error("Failed to Jira Auth : " + error.message);
    return false;
  }
}

export async function sendJiraCodeRest(code: string) {
  try {
    const res = await axios.post(
      `${apiEndPoints.jira}`,
      { code: code },
      {
        headers: {
          Authorization: `Bearer ${GetCookie("access_token")}`,
        },
      }
    );
    return res.data;
  } catch (error: any) {
    console.log("🚀 ~ file: restApi.ts:210 ~ sendJiraCodeRest ~ error:", error);
    toast.error("Failed to Jira Auth : " + error.response?.data?.message);
    return false;
  }
}

export async function getIntegrationsRest(token?: string) {
  console.log(
    "🚀 ~ file: restApi.ts:215 ~ getIntegrationsRest ~ token:",
    token
  );
  console.log("<><><>", getLocalStorage("access_token"));

  try {
    const res = await axios.get(`${apiEndPoints.integrations}`, {
      headers: {
        Authorization: `Bearer ${token ? token : GetCookie("access_token")}`,
      },
    });
    console.log("getIntegrationsRest", res);
    return res.data;
  } catch (error: any) {
    toast.error("Failed to Get Task : " + error.message);
    return false;
  }
}
