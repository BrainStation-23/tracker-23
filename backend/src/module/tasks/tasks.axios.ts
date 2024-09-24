import axios from 'axios';

export const fetchProjectStatusList = async (params: {
  siteId: string;
  projectId: number;
  accessToken: string;
}) => {
  const { siteId, projectId, accessToken } = params;
  try {
    const getStatusByProjectIdUrl = `https://api.atlassian.com/ex/jira/${siteId}/rest/api/3/project/${projectId}/statuses`;
    const response = await axios.get(getStatusByProjectIdUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data;
  } catch (err) {
    return [];
  }
};

export const fetchTasksByProject = async (params: {
  siteId: string;
  projectId: number;
  headers: any;
  syncTime: number;
  startAt?: number; // Optional pagination parameter
}) => {
  const { siteId, projectId, headers, syncTime, startAt = 0 } = params;
  try {
    const url = `https://api.atlassian.com/ex/jira/${siteId}/rest/api/3/search`;
    const jql = `project=${projectId} AND created >= startOfMonth(-${syncTime}M) AND created <= endOfDay()`;
    const fields =
      'summary, assignee,timeoriginalestimate,project, comment,parent, created, updated,status,priority';
    const response = await axios.get(url, {
      headers,
      params: {
        jql,
        startAt,
        maxResults: 100,
        fields,
      },
    });
    return response.data;
  } catch (err) {
    console.error('Error fetching tasks:', err);
    return [];
  }
};
