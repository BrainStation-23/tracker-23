import { UserWorkspaceStatus } from "@prisma/client";

export class GetUserWorkspaceFilter {
  id?: number;
  userId?: number;
  workspaceId?: number;
  status?: UserWorkspaceStatus;
}