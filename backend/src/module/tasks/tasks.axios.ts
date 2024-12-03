import { Project } from '@prisma/client';
import axios from 'axios';

export const fetchProjectStatusList = async (params: {
  siteId: string;
  project: Project;
  accessToken: string;
}) => {
  const { siteId, project, accessToken } = params;
  try {
    const projectSource = project.source;
    const projectId = project.id;
    let getStatusByProjectIdUrl: string;
    let transformedData: any[];

    if (projectSource.includes('dev.azure.com')) {
      const organizationName = siteId;
      const projectName = project.projectName;
      getStatusByProjectIdUrl = `https://dev.azure.com/${organizationName}/${projectName}/_apis/wit/workItemTypes?api-version=7.0`;
      const response = await axios.get(getStatusByProjectIdUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      transformedData = response.data.value.map(
        (workType: { name: any; states: { name: any; category: any }[] }) => ({
          type: workType.name,
          status: workType.states.map(
            (state: { name: any; category: any; id?: string }) => ({
              name: state.name,
              statusCategory: state.category,
              id: undefined,
              untranslatedName: undefined,
            }),
          ),
        }),
      );
    } else {
      getStatusByProjectIdUrl = `https://api.atlassian.com/ex/jira/${siteId}/rest/api/3/project/${projectId}/statuses`;
      const response = await axios.get(getStatusByProjectIdUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      transformedData = response.data.map(
        (workType: {
          name: any;
          statuses: { name: any; category: any }[];
        }) => ({
          type: workType.name,
          status: workType.statuses.map((status: any) => ({
            id: status.id,
            name: status.name,
            untranslatedName: status.untranslatedName,
            statusCategory: status.statusCategory,
          })),
        }),
      );
    }
    return transformedData;
  } catch (err) {
    return [];
  }
};

export const getCustomSprintField = async (siteId: string, headers: any) => {
  const fieldsUrl = `https://api.atlassian.com/ex/jira/${siteId}/rest/api/3/field`;
  const response = await axios.get(fieldsUrl, {
    headers,
  });
  for (const field of response?.data) {
    if (field.name == 'Sprint') return field.key;
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
    const sprintCustomField = await getCustomSprintField(siteId, headers);
    const fields = `summary, assignee,timeoriginalestimate,project, comment,parent, created, updated, status, priority, ${sprintCustomField}`;
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

export const fetchAzureTasksByProject = async (params: {
  organizationName: string;
  projectName: string;
  accessToken: string | null;
}) => {
  const { organizationName, projectName, accessToken } = params;
  try {
    const url = ` https://dev.azure.com/${organizationName}/${projectName}/_apis/wit/wiql?api-version=7.0`;
    const body = {
      query: `
        SELECT [System.Id], [System.Title], [System.State]
        FROM WorkItems
        WHERE [System.TeamProject] = '${projectName}' AND [System.WorkItemType] = 'Task'
        ORDER BY [System.CreatedDate] DESC
      `,
    };
    const headers: any = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    };
    try {
      const response = await axios.post(url, body, { headers });
      const taskIds = response.data.workItems.map((item: { id: any; }) => item.id);
      return taskIds;
    } catch (error) {
      console.error('Error fetching tasks:', error.response?.data || error.message);
    }
  } catch (err) {
    console.error('Error fetching tasks:', err);
    return [];
  }
};

