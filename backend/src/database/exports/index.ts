import { Injectable } from "@nestjs/common";
import { IntegrationType } from "@prisma/client";
import { PrismaService } from "src/module/prisma/prisma.service";

@Injectable()
export class ExportDatabase {
  constructor(private prisma: PrismaService) {}

  async getTasks(filter: any) {
    try {
      return await this.prisma.task.findMany({
        where: {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          //@ts-ignore
          userWorkspaceId: filter?.userWorkspaceIds
            ? { in: filter?.userWorkspaceIds }
            : // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              //@ts-ignore
              filter?.userWorkspace.id,
          source: IntegrationType.JIRA,
          id: { in: filter?.taskIds },
          ...(filter?.projectIdArray && {
            projectId: {
              in: filter?.projectIdArray.map((id: any) => Number(id)),
            },
          }),
          ...(filter?.priority1 && {
            priority: { in: filter?.priority1 },
          }),
          ...(filter?.status1 && { status: { in: filter?.status1 } }),
          ...(filter?.text && {
            title: {
              contains: filter?.text,
              mode: 'insensitive',
            },
          }),
        },
        select: {
          title: true,
          description: true,
          assigneeId: true,
          projectName: true,
          estimation: true,
          status: true,
          due: true,
          priority: true,
          labels: true,
          createdAt: true,
          updatedAt: true,
          userWorkspaceId: true,
          source: true,
          sessions: {
            select: {
              startTime: true,
              endTime: true,
              status: true,
              createdAt: true,
              updatedAt: true,
              authorId: true,
              worklogId: true,
              userWorkspace: {
                include: {
                  user: {
                    select: {
                      firstName: true,
                      lastName: true,
                    },
                  },
                },
              },
            },
          },
          url: true,
          userWorkspace: {
            select: {
              user: true,
            },
          },
        },
      });
    } catch (error) {
      console.log(error);
      return [];
    }
  }

  async getTasksWithinTimeRange(filter: any) {
    try {
      return await this.prisma.task.findMany({
        where: {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          //@ts-ignore
          userWorkspaceId: filter?.userWorkspaceIds
            ? { in: filter?.userWorkspaceIds }
            : // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              //@ts-ignore
              filter?.userWorkspace.id,
          ...(filter?.projectIdArray && {
            projectId: { in: filter?.projectIdArray.map((id: any) => Number(id)) },
          }),
          ...(filter?.startDate &&
            filter?.endDate && {
              createdAt: { lte: filter?.endDate },
              updatedAt: { gte: filter?.startDate },
            }),
          ...(filter?.priority1 && { priority: { in: filter?.priority1 } }),
          ...(filter?.status1 && { status: { in: filter?.status1 } }),
          ...(filter?.text && {
            title: {
              contains: filter?.text,
              mode: 'insensitive',
            },
          }),
        },
        select: {
          title: true,
          description: true,
          assigneeId: true,
          projectName: true,
          estimation: true,
          status: true,
          due: true,
          priority: true,
          labels: true,
          createdAt: true,
          updatedAt: true,
          userWorkspaceId: true,
          source: true,
          sessions: {
            select: {
              startTime: true,
              endTime: true,
              status: true,
              createdAt: true,
              updatedAt: true,
              authorId: true,
              worklogId: true,
              userWorkspace: {
                include: {
                  user: {
                    select: {
                      firstName: true,
                      lastName: true,
                    },
                  },
                },
              },
            },
          },
          url: true,
          userWorkspace: {
            select: {
              user: true,
            },
          },
        },
      });
    } catch (error) {
      console.log(error);
      return [];
    }
  }
}