import { IntegrationType } from "@prisma/client";

export class GetActiveSprintTasks {
  userWorkspaceId: number;
  taskIds: number[];
  priority?: string[];
  status?: string[];
  text?: string;
}