import { UserIntegration } from '@prisma/client';
import axios from 'axios';

export class JiraApiCalls {
  async getTransitions(userIntegration: UserIntegration, url: string) {
    console.log(
      '🚀 ~ JiraApiCalls ~ getTransitions ~ userIntegration:',
      userIntegration,
    );
    try {
      const config = {
        method: 'get',
        url,
        headers: {
          Authorization: `Bearer ${userIntegration.accessToken}`,
          'Content-Type': 'application/json',
        },
      };
      const updatedTransition = (await axios(config)).data;
      return updatedTransition;
    } catch (err) {
      console.log(
        '🚀 ~ file: api.ts:17 ~ JiraApiCalls ~ getTransitions ~ err:',
        err,
      );
      return null;
    }
  }

  async updatedIssues(
    userIntegration: UserIntegration,
    url: string,
    statusBody: any,
  ) {
    try {
      const config = {
        method: 'post',
        url,
        headers: {
          Authorization: `Bearer ${userIntegration.accessToken}`,
          'Content-Type': 'application/json',
        },
        data: statusBody,
      };
      const res = await axios(config);
      return res.status;
    } catch (err) {
      console.log('🚀 ~ file: api.ts:39 ~ JiraApiCalls ~ err:', err);
    }
  }

  async updateIssuePriority(
    userIntegration: UserIntegration,
    url: string,
    priority: any,
  ) {
    try {
      const config = {
        url,
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${userIntegration.accessToken}`,
          'Content-Type': 'application/json',
        },
        data: {
          fields: {
            priority: {
              name: priority, // Use the variable directly without string interpolation
            },
          },
        },
      };
      const res = await axios(config);
      return res.status;
    } catch (err) {
      console.log('🚀 ~ file: api.ts:39 ~ JiraApiCalls ~ err:', err);
    }
  }

  async UpdateIssueEstimation(
    userIntegration: UserIntegration,
    url: string,
    estimationBody: any,
  ) {
    try {
      const config = {
        method: 'put',
        url,
        headers: {
          Authorization: `Bearer ${userIntegration?.accessToken}`,
          'Content-Type': 'application/json',
        },
        data: estimationBody,
      };
      const updatedIssue = await axios(config);
      return updatedIssue.status;
    } catch (err) {
      console.log('🚀 ~ file: api.ts:69 ~ JiraApiCalls ~ err:', err);
      return null;
    }
  }

  async getJiraSprint(
    userIntegration: UserIntegration,
    url: string,
    param: any,
  ) {
    try {
      const sprintConfig = {
        method: 'get',
        url,
        headers: {
          Authorization: `Bearer ${userIntegration?.accessToken}`,
          'Content-Type': 'application/json',
        },
        params: param,
      };
      const res = await axios(sprintConfig);
      return res;
    } catch (err) {
      return null;
    }
  }
  async getBoardList(userIntegration: UserIntegration, url: string) {
    try {
      const boardConfig = {
        method: 'get',
        url,
        headers: {
          Authorization: `Bearer ${userIntegration?.accessToken}`,
          'Content-Type': 'application/json',
        },
      };
      const boardList = await (await axios(boardConfig)).data;
      return boardList;
    } catch (err) {
      console.log('🚀 ~ JiraApiCalls ~ getBoardList ~ err:', err.message);
      return [];
    }
  }
  async getSprintIssueList(
    userIntegration: UserIntegration,
    url: string,
    param: any,
  ) {
    const sprintIssueConfig = {
      method: 'get',
      url,
      headers: {
        Authorization: `Bearer ${userIntegration?.accessToken}`,
        'Content-Type': 'application/json',
      },
      params: param,
    };
    const res = await axios(sprintIssueConfig);
    return res;
  }

  async importJiraPriorities(userIntegration: UserIntegration, url: string) {
    const priorityConfig = {
      method: 'get',
      url,
      headers: {
        Authorization: `Bearer ${userIntegration?.accessToken}`,
        'Content-Type': 'application/json',
      },
    };
    const priorityList = await (await axios(priorityConfig)).data;
    return priorityList;
  }

  async getProjectStatuses(userIntegration: UserIntegration, url: string) {
    const statusConfig = {
      method: 'get',
      url,
      headers: {
        Authorization: `Bearer ${userIntegration?.accessToken}`,
        'Content-Type': 'application/json',
      },
    };
    console.log(
      '🚀 ~ file: api.ts:174 ~ JiraApiCalls ~ getProjectStatuses ~ statusConfig:',
      statusConfig,
    );
    const statusList = await (await axios(statusConfig)).data;
    return statusList;
  }

  async importJiraTasks(
    userIntegration: UserIntegration,
    url: string,
    param: any,
  ) {
    const taskConfig = {
      method: 'get',
      url,
      headers: {
        Authorization: `Bearer ${userIntegration?.accessToken}`,
        'Content-Type': 'application/json',
      },
      params: param,
    };
    const taskList = await (await axios(taskConfig)).data;
    return taskList;
  }

  async importJiraWorklog(
    userIntegration: UserIntegration,
    url: string,
    param: any,
  ) {
    const worklogConfig = {
      method: 'get',
      url,
      headers: {
        Authorization: `Bearer ${userIntegration?.accessToken}`,
        'Content-Type': 'application/json',
      },
      params: param,
    };
    const worklogList = await axios(worklogConfig);
    return worklogList;
  }

  async registerWebhook(
    userIntegration: UserIntegration,
    url: string,
    formateReqBody: any,
  ) {
    try {
      const config = {
        method: 'post',
        url,
        headers: {
          Authorization: `Bearer ${userIntegration?.accessToken}`,
          'Content-Type': 'application/json',
        },
        data: formateReqBody,
      };
      const webhook = await (await axios(config)).data;
      return webhook;
    } catch (err) {
      console.log('🚀 ~ file: api.ts:69 ~ JiraApiCalls ~ err:', err);
      return null;
    }
  }

  async registerOutlookWebhook(
    userIntegration: UserIntegration,
    url: string,
    formateReqBody: any,
  ) {
    try {
      const config = {
        method: 'post',
        url,
        headers: {
          Authorization: `Bearer ${userIntegration?.accessToken}`,
          'Content-Type': 'application/json',
        },
        data: formateReqBody,
      };
      const webhook = await (await axios(config)).data;
      return webhook;
    } catch (err) {
      console.log('🚀 ~ file: api.ts:69 ~ JiraApiCalls ~ err:', err);
      return null;
    }
  }

  async getCalendarEvents(userIntegration: UserIntegration, url: string) {
    try {
      const headers: any = {
        Authorization: `Bearer ${userIntegration.accessToken}`,
      };
      const config = {
        method: 'GET',
        url,
        headers,
      };
      return (await axios(config)).data;
    } catch (err) {
      console.log(
        '🚀 ~ file: api.ts:255 ~ JiraApiCalls ~ getCalendarEvents ~ err:',
        err,
      );
      return null;
    }
  }

  async jiraApiGetCall(userIntegration: UserIntegration, url: string) {
    const taskConfig = {
      method: 'get',
      url,
      headers: {
        Authorization: `Bearer ${userIntegration?.accessToken}`,
        'Content-Type': 'application/json',
      },
    };
    const res = await (await axios(taskConfig)).data;
    return res;
  }
}
