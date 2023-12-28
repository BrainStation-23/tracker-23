import { IntegrationType } from "models/integration";

export type ProjectDto = {
  id: number;
  source: string;
  integrated: boolean;
  integrationID: number;
  userId: number;
  projectId: number | null;
  projectName: string;
  projectKey: string | null;
  integrationId: number | null;
  workspaceId: number;
  statuses: StatusDto[];
  priorities: PriorityDto[];
  integrationType: IntegrationType;
};

export type StatusDto = {
  id: number;
  statusId: string | null;
  name: string;
  untranslatedName: string | null;
  statusCategoryId: string | null;
  statusCategoryName: string;
  transitionId: string | null;
  projectId: number | null;
};

export type PriorityDto = {
  id: number;
  priorityId: string | null;
  name: string;
  priorityCategoryName: string;
  iconUrl: string;
  color: string;
  projectId: number | null;
};
