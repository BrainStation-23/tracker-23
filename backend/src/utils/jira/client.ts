import axios from 'axios';

export class JiraClient {
  constructor(private access_token: string) {}

  async getMyProfile() {
    return this.sendRequest('get', 'me');
  }

  async sendRequest(
    method: string,
    endpoint: string,
    headers?: any,
    body?: any,
  ) {
    const resp = await axios.get(`https://api.atlassian.com/${endpoint}`, {
      method,
      headers: {
        'content-type': 'application/json',
        Authorization: `Bearer ${this.access_token}`,
        ...headers,
      },
      data: { ...body },
    });
    return resp.data;
  }
}
