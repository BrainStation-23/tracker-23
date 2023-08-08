import {
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as argon from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoginDto, RegisterDto, userDto } from './dto';
import { WorkspacesService } from 'src/workspaces/workspaces.service';
import { APIException } from 'src/internal/exception/api.exception';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
    private jwt: JwtService,
    private workspacesService: WorkspacesService,
  ) {}

  async createUser(dto: RegisterDto) {
    const data = {
      email: dto?.email,
      firstName: dto?.firstName,
      lastName: dto?.lastName,
      hash: await argon.hash(dto?.password),
    };
    try {
      const user = await this.prisma.user.create({
        data,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      });

      const workspace =
        user.firstName &&
        (await this.workspacesService.createWorkspace(
          user.id,
          `${user.firstName}'s Workspace`,
        ));
      const updateUser =
        workspace &&
        (await this.prisma.user.update({
          where: {
            id: user.id,
          },
          data: {
            activeWorkspaceId: workspace.id,
          },
        }));
      return updateUser;
    } catch (err) {
      throw new APIException(
        'Can not create user!',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getUser(dto: RegisterDto) {
    return await this.prisma.user.findUnique({
      where: { email: dto.email },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
      },
    });
  }

  async register(dto: RegisterDto) {
    const email = dto?.email?.toLowerCase();
    dto.email = email;

    const doesExistUser = await this.getUser(dto);
    if (doesExistUser) {
      throw new APIException('Email already in Use!', HttpStatus.BAD_REQUEST);
      // const token = await this.createToken(doesExistUser);
      // return { ...doesExistUser, ...token };
    }

    return await this.createUser(dto);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto?.email?.toLowerCase() },
    });

    if (!user) {
      throw new NotFoundException(
        'Email is not registered. Please sign up to continue.',
      );
    }
    let isPasswordMatched;
    if (user.hash) {
      isPasswordMatched = await argon.verify(user.hash, dto.password);
    }
    if (!isPasswordMatched) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = await this.createToken(user);
    return {
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      ...token,
    };
  }

  async createToken(user: any): Promise<{ access_token: string }> {
    const payload = { email: user.email, sub: user.id };
    const access_token = await this.jwt.signAsync(payload, {
      secret: this.config.get('JWT_SECRET'),
      expiresIn: '1d',
    });

    return {
      access_token,
    };
  }

  async googleLogin(req: any) {
    if (!req.user) {
      console.log('No user from google');
      return 'No user from google';
    }
    console.log(req.user);
    console.log('User information from google...');
    const queryData = {
      email: req.user.email,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      picture: req.user.picture,
    };
    try {
      const oldUser = await this.prisma.user.findUnique({
        where: { email: req.user.email },
      });
      if (oldUser) {
        console.log('Old User Found');
        if (!oldUser.activeWorkspaceId) {
          const workspace =
            oldUser.firstName &&
            (await this.workspacesService.createWorkspace(
              oldUser.id,
              `${oldUser.firstName}'s Workspace`,
            ));
          const updatedOldUser =
            workspace &&
            (await this.prisma.user.update({
              where: {
                id: oldUser.id,
              },
              data: {
                activeWorkspaceId: workspace.id,
              },
            }));
          const updatedUser =
            updatedOldUser && (await this.getFormattedUserData(updatedOldUser));
          return updatedUser;
        }
        return await this.getFormattedUserData(oldUser);
      }

      const user = await this.prisma.user.create({
        data: queryData,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          picture: true,
        },
      });
      console.log(
        '🚀 ~ file: auth.service.ts:154 ~ AuthService ~ googleLogin ~ user:',
        user,
      );
      const workspace =
        user.firstName &&
        (await this.workspacesService.createWorkspace(
          user.id,
          `${user.firstName}'s Workspace`,
        ));
      const updateUser =
        workspace &&
        (await this.prisma.user.update({
          where: {
            id: user.id,
          },
          data: {
            activeWorkspaceId: workspace.id,
          },
        }));
      const updatedUser =
        updateUser && (await this.getFormattedUserData(updateUser));
      return updatedUser;
    } catch (error) {
      console.log(
        '🚀 ~ file: auth.service.ts:145 ~ AuthService ~ googleLogin ~ error:',
        error,
      );
    }
  }

  async getFormattedUserData(user: User) {
    const token = await this.createToken(user);
    const { id, firstName, lastName, email, picture, activeWorkspaceId } = user;
    return {
      id,
      firstName,
      lastName,
      email,
      picture,
      activeWorkspaceId,
      ...token,
    };
  }
  async getUserFromAccessToken(accessToken: string): Promise<userDto | null> {
    try {
      const decoded = this.jwt.verify(accessToken, {
        secret: this.config.get('JWT_SECRET'),
      });

      const user = await this.prisma.user.findUnique({
        where: { id: decoded.sub },
      });

      return user as userDto;
    } catch (error) {
      // If the token is invalid or expired, throw an UnauthorizedException
      return null;
    }
  }
}
