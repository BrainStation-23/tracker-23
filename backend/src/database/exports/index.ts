import { Injectable } from '@nestjs/common';
import { IntegrationType } from '@prisma/client';
import { PrismaService } from 'src/module/prisma/prisma.service';

@Injectable()
export class ExportDatabase {
  constructor(private prisma: PrismaService) {}

  async getTasks(filter: any) {
    try {
      const queryFilter: any = {};

      if (filter.text) {
        queryFilter.OR = [
          {
            title: {
              contains: filter.text.replace(
                /[+\-]/g,
                (match: any) => `\\${match}`,
              ),
              mode: 'insensitive',
            },
          },
          {
            key: {
              contains: filter.text.replace(
                /[+\-]/g,
                (match: any) => `\\${match}`,
              ),
            },
          },
        ];
      }
      return await this.prisma.task.findMany({
        where: {
          userWorkspaceId:
            filter?.userWorkspaceIds.length > 0
              ? { in: filter?.userWorkspaceIds }
              : filter?.currentUserWorkspace.id,
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
          ...queryFilter,
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
          key: true,
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
      const queryFilter: any = {};

      if (filter.text) {
        queryFilter.OR = [
          {
            title: {
              contains: filter.text.replace(
                /[+\-]/g,
                (match: any) => `\\${match}`,
              ),
              mode: 'insensitive',
            },
          },
          {
            key: {
              contains: filter.text.replace(
                /[+\-]/g,
                (match: any) => `\\${match}`,
              ),
            },
          },
        ];
      }

      return await this.prisma.task.findMany({
        where: {
          userWorkspaceId:
            filter?.userWorkspaceIds.length > 0
              ? { in: filter?.userWorkspaceIds }
              : filter?.currentUserWorkspace.id,
          ...(filter?.projectIdArray && {
            projectId: {
              in: filter?.projectIdArray.map((id: any) => Number(id)),
            },
          }),
          ...(filter?.startDate &&
            filter?.endDate && {
              createdAt: { lte: filter?.endDate },
              updatedAt: { gte: filter?.startDate },
            }),
          ...(filter?.priority1 && { priority: { in: filter?.priority1 } }),
          ...(filter?.status1 && { status: { in: filter?.status1 } }),
          ...queryFilter,
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
          key: true,
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

  async getTasksWithDetails(filter: any) {
    try {
      const queryFilter: any = {};

      if (filter.text) {
        queryFilter.OR = [
          {
            title: {
              contains: filter.text.replace(
                /[+\-]/g,
                (match: any) => `\\${match}`,
              ),
              mode: 'insensitive',
            },
          },
          {
            key: {
              contains: filter.text.replace(
                /[+\-]/g,
                (match: any) => `\\${match}`,
              ),
            },
          },
        ];
      }
      return await this.prisma.task.findMany({
        where: {
          userWorkspaceId:
            filter?.userWorkspaceIds.length > 0
              ? { in: filter?.userWorkspaceIds }
              : filter?.currentUserWorkspace.id,
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
          ...queryFilter,
        },
        include: {
          sessions: {
            include: {
              userWorkspace: {
                select: {
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
          parentTask: {
            select: {
              title: true,
              url: true,
              key: true,
            },
          },
          childTask: {
            select: {
              title: true,
              url: true,
              key: true,
            },
          },
        },
      });
    } catch (error) {
      console.log(error);
      return [];
    }
  }

  async getTasksWithinTimeRangeWithDetails(filter: any) {
    try {
      const queryFilter: any = {};

      if (filter.text) {
        queryFilter.OR = [
          {
            title: {
              contains: filter.text.replace(
                /[+\-]/g,
                (match: any) => `\\${match}`,
              ),
              mode: 'insensitive',
            },
          },
          {
            key: {
              contains: filter.text.replace(
                /[+\-]/g,
                (match: any) => `\\${match}`,
              ),
            },
          },
        ];
      }

      return await this.prisma.task.findMany({
        where: {
          userWorkspaceId:
            filter?.userWorkspaceIds.length > 0
              ? { in: filter?.userWorkspaceIds }
              : filter?.currentUserWorkspace.id,
          ...(filter?.projectIdArray && {
            projectId: {
              in: filter?.projectIdArray.map((id: any) => Number(id)),
            },
          }),
          ...(filter?.startDate &&
            filter?.endDate && {
              createdAt: { lte: filter?.endDate },
              updatedAt: { gte: filter?.startDate },
            }),
          ...(filter?.priority1 && { priority: { in: filter?.priority1 } }),
          ...(filter?.status1 && { status: { in: filter?.status1 } }),
          ...queryFilter,
        },
        include: {
          sessions: {
            include: {
              userWorkspace: {
                select: {
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
          parentTask: {
            select: {
              title: true,
              url: true,
              key: true,
            },
          },
          childTask: {
            select: {
              title: true,
              url: true,
              key: true,
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
