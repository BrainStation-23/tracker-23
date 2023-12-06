import { message } from "antd";
import axios from "axios";
import {
  CreateLocalProjectModel,
  CreateWorkspaceModel,
  SearchParamsModel,
  SprintReportParamsModel,
} from "models/apiParams";
import {
  ForgotPasswordDto,
  LoginDto,
  LoginResponseDto,
  RegisterDto,
  ResetPasswordDto,
} from "models/auth";
import { SendWorkspaceInviteDto } from "models/invitation";
import {
  AddWorkLogParams,
  CreateTaskDto,
  UpdateTaskEstimationParams,
  UpdateTaskStatusParams,
} from "models/tasks";
import Router from "next/router";
import { apiEndPoints } from "utils/apiEndPoints";

import { RemoveCookie, SetCookie } from "@/services/cookie.service";
import { getLabels, getStringFromArray } from "@/services/taskActions";
import { clearLocalStorage, setLocalStorage } from "@/storage/storage";

import { sortByStatus } from "../src/services/taskActions";
import { getTimeSheetReportDto } from "models/reports";
import { disconnectSocket } from "@/services/socket.service";
import { updateApprovalUserDto } from "models/user";

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
    console.log("🚀 ~ file: restApi.ts:48 ~ error:", error);
    return null;
  }
}

export async function loginFromInviteRest(
  data: LoginDto
): Promise<LoginResponseDto | undefined> {
  try {
    const res = await axios.post(`${apiEndPoints.invitedUserLogin}`, data);
    if (res?.data?.access_token) {
      SetCookie("access_token", res?.data?.access_token);
      setLocalStorage("access_token", res?.data?.access_token);
      setLocalStorage("userDetails", res.data);
    }
    return res.data;
  } catch (error: any) {
    console.log("🚀 ~ file: restApi.ts:48 ~ error:", error);
    return null;
  }
}

export async function googleLoginRest(
  code: string,
  invitationCode?: string
): Promise<LoginResponseDto | undefined> {
  try {
    const res = await axios.post(
      `${apiEndPoints.googleLogin}?code=${code}${
        invitationCode ? `&&invitationCode=${invitationCode}` : ""
      }`
    );
    return res.data;
  } catch (error: any) {
    console.log("🚀 ~ file: restApi.ts:59 ~ error:", error);
    return null;
  }
}

export async function registerRest(
  data: RegisterDto
): Promise<RegisterDto | undefined> {
  try {
    const res = await axios.post(`${apiEndPoints.register}`, data);
    return res.data;
  } catch (error: any) {
    console.log("🚀 ~ file: restApi.ts:59 ~ error:", error);
    return null;
  }
}

export async function registerFromInviteRest(
  data: RegisterDto
): Promise<RegisterDto | undefined> {
  try {
    const res = await axios.post(`${apiEndPoints.invitedUserRegister}`, data);
    if (res?.data?.access_token) {
      SetCookie("access_token", res?.data?.access_token);
      setLocalStorage("access_token", res?.data?.access_token);
      setLocalStorage("userDetails", res.data);
    }
    return res.data;
  } catch (error: any) {
    console.log("🚀 ~ file: restApi.ts:59 ~ error:", error);
    return null;
  }
}

export async function forgotPasswordRest(
  data: ForgotPasswordDto
): Promise<any> {
  try {
    const res = await axios.post(`${apiEndPoints.forgotPassword}`, data);
    return res.data;
  } catch (error: any) {
    console.log("🚀 ~ file: restApi.ts:59 ~ error:", error);
    return null;
  }
}

export async function resetPasswordRest(
  token: string,
  data: ResetPasswordDto
): Promise<any> {
  try {
    const res = await axios.patch(
      `${apiEndPoints.resetPassword}/${token}`,
      data
    );
    return res.data;
  } catch (error: any) {
    console.log("🚀 ~ file: restApi.ts:59 ~ error:", error);
    return null;
  }
}

export async function logoutRest() {
  try {
    RemoveCookie("access_token");
    clearLocalStorage();
    // deleteFromLocalStorage("userDetails");
    message.success("Logged Out");
    await disconnectSocket();
    Router.push("/login");
    return true;
  } catch (error: any) {
    message.error("Failed to Log Out");
    return false;
  }
}

export async function createTaskRest(data: CreateTaskDto) {
  try {
    const res = await axios.post(`${apiEndPoints.tasks}/create`, data);
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
  const projectIds = searchParams?.projectIds;
  const { userIds } = searchParams;
  try {
    const res = await axios.get(
      apiEndPoints.tasks +
        "?" +
        (sprints?.length > 0
          ? `sprintId=${sprints}`
          : searchParams?.selectedDate?.length === 2
          ? `startDate=${searchParams?.selectedDate[0]}&endDate=${searchParams?.selectedDate[1]}`
          : "") +
        (userIds ? `&userIds=${userIds}` : "") +
        (searchParams?.searchText && searchParams?.searchText.length > 0
          ? `&text=${encodeURIComponent(searchParams.searchText)}`
          : "") +
        (projectIds?.length > 0 ? `&projectIds=${projectIds}` : "") +
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
  const status = getStringFromArray(getLabels(searchParams?.status));
  const sprints = searchParams?.sprints;
  const priority = getStringFromArray(searchParams?.priority);
  const projectIds = searchParams?.projectIds;
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
          ? `&text=${encodeURIComponent(searchParams.searchText)}`
          : "") +
        (projectIds?.length > 0 ? `&projectIds=${projectIds}` : "") +
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

export async function syncAllTasksRest() {
  try {
    const res = await axios.get(`${apiEndPoints.synAllTasks}`);
    return res.data;
  } catch (error: any) {
    return false;
  }
}

export async function syncProjectTasksRest(projectId: number) {
  try {
    const res = await axios.get(
      `${apiEndPoints.syncProjectTasks}/${projectId}`
    );
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
    const res = await axios.post(`${apiEndPoints.authJira}`, {
      code: code,
    });
    return res.data;
  } catch (error: any) {
    return false;
  }
}

export async function uninstallIntegrationRest(id: number) {
  try {
    const res = await axios.delete(`${apiEndPoints.integrations}/user/${id}`);
    message.success(res?.data?.message);
    return true;
  } catch (error: any) {
    return false;
  }
}

export async function deleteIntegrationRest(id: number) {
  try {
    const res = await axios.delete(`${apiEndPoints.integrations}/admin/${id}`);
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

export async function getIntegratedProjectStatusesRest() {
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
export async function markAllNotificationsClearedRest() {
  try {
    const res = await axios.patch(
      `${apiEndPoints.markAllNotificationsCleared}`
    );
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
  const projectIds = searchParams?.projectIds;
  try {
    const res = await axios.get(
      `${apiEndPoints.activeSprintTasks}/?state=${["active"]}` +
        (searchParams?.searchText && searchParams?.searchText.length > 0
          ? `&text=${encodeURIComponent(searchParams.searchText)}`
          : "") +
        (priority && priority.length > 0 ? `&priority=${priority}` : "") +
        (projectIds?.length > 0 ? `&projectIds=${projectIds}` : "") +
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
    const res = await axios.get(`${apiEndPoints.projects}`);
    return res.data;
  } catch (error: any) {
    return false;
  }
}

export async function importProjectRest(id: number) {
  try {
    const res = await axios.get(`${apiEndPoints.projects}/${id}`);
    return res.data;
  } catch (error: any) {
    return false;
  }
}

export async function createProjectRest(data: CreateLocalProjectModel) {
  try {
    const res = await axios.post(`${apiEndPoints.projects}/create`, data);
    return res.data;
  } catch (error: any) {
    return false;
  }
}
export async function deleteProjectTasksRest(id: number) {
  try {
    const res = await axios.post(`${apiEndPoints.projects}/${id}`);
    return res.data;
  } catch (error: any) {
    return false;
  }
}
export async function getWorkspaceListRest() {
  try {
    const res = await axios.get(`${apiEndPoints.workspaces}`);
    res.data.workspaces = res.data.workspaces.map((workspace: any) => {
      return {
        ...workspace,
        active: workspace.id === res.data.user.activeWorkspaceId,
      };
    });
    return res.data;
  } catch (error: any) {
    return false;
  }
}

export async function getWorkspaceMembersRest() {
  try {
    const res = await axios.get(`${apiEndPoints.members}`);
    return res.data;
  } catch (error: any) {
    return false;
  }
}
export async function createWorkspaceRest(data: CreateWorkspaceModel) {
  try {
    const res = await axios.post(`${apiEndPoints.workspaces}`, data);
    return res.data;
  } catch (error: any) {
    return false;
  }
}
export async function updateWorkspaceRest(
  data: CreateWorkspaceModel,
  id: number
) {
  try {
    const res = await axios.patch(`${apiEndPoints.workspaces}/${id}`, data);
    return res.data;
  } catch (error: any) {
    return false;
  }
}
export async function changeWorkspaceRest(id: number) {
  try {
    const res = await axios.patch(`${apiEndPoints.changeWorkspace}/${id}`);
    return res.data;
  } catch (error: any) {
    return false;
  }
}

export async function deleteWorkspaceRest(id: number) {
  try {
    const res = await axios.delete(`${apiEndPoints.workspaces}/${id}`);
    return res.data;
  } catch (error: any) {
    return false;
  }
}

export async function sendWorkspaceInvitationRest(
  data: SendWorkspaceInviteDto
) {
  try {
    const res = await axios.post(`${apiEndPoints.invitation}/send`, data);
    return res.data;
  } catch (error: any) {
    return false;
  }
}

export async function getWorkspaceInvitationListRest() {
  try {
    const res = await axios.get(`${apiEndPoints.invitation}/list`);
    return res.data;
  } catch (error: any) {
    return false;
  }
}

export async function acceptWorkspaceInvitationRest(id: number) {
  try {
    const res = await axios.patch(`${apiEndPoints.invitation}/response/${id}`, {
      status: "ACTIVE",
    });
    return res.data;
  } catch (error: any) {
    return false;
  }
}
export async function rejectWorkspaceInvitationRest(id: number) {
  try {
    const res = await axios.patch(`${apiEndPoints.invitation}/response/${id}`, {
      status: "REJECTED",
    });
    return res.data;
  } catch (error: any) {
    return false;
  }
}

export async function getWorkspaceSettingsRest() {
  try {
    const res = await axios.get(`${apiEndPoints.workspaceSettings}`);
    return res.data;
  } catch (error: any) {
    return false;
  }
}
export async function updateSyncTimeRest(time: number) {
  try {
    const res = await axios.patch(`${apiEndPoints.workspaceSettings}`, {
      syncTime: time,
    });
    return res.data;
  } catch (error: any) {
    return false;
  }
}
export async function updateTimeFormatRest(value: string) {
  try {
    const res = await axios.patch(`${apiEndPoints.workspaceSettings}`, {
      timeFormat: value,
    });
    return res.data;
  } catch (error: any) {
    return false;
  }
}

export async function getTimeSheetReportRest({
  startDate,
  endDate,
  userIds,
  projectIds,
}: getTimeSheetReportDto) {
  try {
    const res = await axios.get(
      `${apiEndPoints.timeSheetReport}/` +
        `?startDate=${startDate}&endDate=${endDate}` +
        (userIds?.length > 0 ? `&userIds=${userIds}` : "") +
        (projectIds?.length > 0 ? `&projectIds=${projectIds}` : "")
    );
    return res.data;
  } catch (error: any) {
    return false;
  }
}

export async function getSprintReportRest({
  sprints,
  selectedUsers,
  projectIds,
}: SprintReportParamsModel) {
  try {
    const res = await axios.get(
      `${apiEndPoints.sprintReport}` +
        (sprints?.length > 0 ||
        selectedUsers?.length > 0 ||
        projectIds?.length > 0
          ? `?`
          : "") +
        (sprints?.length > 0 ? `sprintId=${sprints}` : "") +
        (selectedUsers?.length > 0 ? `&userId=${selectedUsers}` : "") +
        (projectIds?.length > 0 ? `&projectIds=${projectIds}` : "")
    );
    return res.data;
  } catch (error: any) {
    return false;
  }
}
export async function getInvitedUserInfoRest(token: string) {
  try {
    const res = await axios.get(`${apiEndPoints.invitedUserInfo}` + token);
    return res.data;
  } catch (error: any) {
    return false;
  }
}
export async function getAllUsersRest() {
  try {
    const res = await axios.get(`${apiEndPoints.allUsers}`);
    return res.data;
  } catch (error: any) {
    return false;
  }
}
export async function updateApprovalUserRest(
  userId: number,
  data: updateApprovalUserDto
) {
  try {
    const res = await axios.patch(
      `${apiEndPoints.updateApprovalUser}${userId}`,
      data
    );
    return res.data;
  } catch (error: any) {
    return false;
  }
}

export async function userListByProjectRest(projectIds: number[]) {
  try {
    const res = await axios.get(
      `${apiEndPoints.userListByProject}` +
        (projectIds?.length > 0 ? `?projectIds=${projectIds}` : "")
    );
    return res.data;
  } catch (error: any) {
    return false;
  }
}
