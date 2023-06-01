import { HttpService } from '@nestjs/axios';
import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { User } from '@prisma/client';
import axios from 'axios';
import { APIException } from 'src/internal/exception/api.exception';
import { PrismaService } from 'src/prisma/prisma.service';
import { TasksService } from 'src/tasks/tasks.service';
@Injectable()
export class SprintsService {
  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
    private httpService: HttpService,
    private taskService: TasksService,
  ) {}

  async getBoardList(user: User) {
    try {
      const updated_integration = await this.taskService.updateIntegration(
        user,
      );
      // console.log(formateReqBody);
      const url = `https://api.atlassian.com/ex/jira/${updated_integration?.siteId}/rest/agile/3.0/board`;
      const config = {
        method: 'post',
        url,
        headers: {
          Authorization: `Bearer ${updated_integration?.accessToken}`,
          'Content-Type': 'application/json',
        },
      };

      const board = await (await axios(config)).data;
      console.log(board);
    } catch (err) {
      console.log(err);
      throw new APIException(
        err.message || 'Fetching problem to register webhook!',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
