import { UserIntegration } from '@prisma/client';
import axios from 'axios';

export class JiraApiCalls {
  async getTransitions(userIntegration: UserIntegration, url: string) {
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
}
