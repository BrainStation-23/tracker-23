import axios from 'axios';
import { jiraConfig } from 'config/jira';

export const getIntegrationDetails = async (params: { code: string }) => {
  try {
    const { code } = params;
    const url = 'https://auth.atlassian.com/oauth/token';
    const headers: any = {
      'Content-Type': 'application/json',
    };
    const body = {
      grant_type: 'authorization_code',
      client_id: jiraConfig.clientId,
      client_secret: jiraConfig.client_secret,
      code,
      redirect_uri: jiraConfig.callback,
    };

    // const response = (
    //   await lastValueFrom(this.httpService.post(url, body, { headers }))
    // ).data;
    const response = await axios.post(url, body, {
      headers,
    });
    return response.data;
  } catch (err) {
    return [];
  }
};

export const getResourceDetails = async (params: { access_token: string }) => {
  try {
    const { access_token } = params;
    const url = `https://api.atlassian.com/oauth/token/accessible-resources`;
    const headers: any = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${access_token}`,
    };
    // (
    //   await lastValueFrom(this.httpService.get(urlResources, { headers }))
    // ).data;

    const response = await axios.get(url, {
      headers,
    });
    return response.data;
  } catch (err) {
    return [];
  }
};
