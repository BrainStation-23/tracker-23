import { UsersDatabase } from 'src/database/users';
import {
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as argon from 'argon2';
import { JwtService } from '@nestjs/jwt';
import {
  ForgotPasswordDto,
  LoginDto,
  PasswordResetDto,
  RegisterDto,
  userDto,
} from './dto';
import { User, UserWorkspaceStatus } from '@prisma/client';
import { Request } from 'express';
import * as crypto from 'crypto';
import { WorkspacesService } from '../workspaces/workspaces.service';
import { EmailService } from '../email/email.service';
import { APIException } from '../exception/api.exception';
import { PrismaService } from '../prisma/prisma.service';
import { UserWorkspaceDatabase } from 'src/database/userWorkspaces';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
    private jwt: JwtService,
    private workspacesService: WorkspacesService,
    private emailService: EmailService,
    private usersDatabase: UsersDatabase,
    private userWorkspaceDatabase: UserWorkspaceDatabase,
  ) {}

  async createUser(dto: RegisterDto) {
    try {
      const user = await this.usersDatabase.createUser({
        email: dto?.email,
        firstName: dto?.firstName,
        lastName: dto?.lastName,
        hash: await argon.hash(dto?.password),
      });

      const workspace =
        user &&
        user.firstName &&
        (await this.workspacesService.createWorkspace(
          user,
          `${user.firstName}'s Workspace`,
        ));
      const updateUser =
        workspace &&
        (await this.usersDatabase.updateUser(user, {
          activeWorkspaceId: workspace.id,
        }));

      updateUser && (await this.usersDatabase.createSettings(workspace?.id));
      return updateUser;
    } catch (err) {
      throw new APIException(
        'Can not create user!',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getUser(dto: RegisterDto) {
    return await this.usersDatabase.findUserByEmail(dto.email);
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
    const user = await this.usersDatabase.findUserWithHash(dto);

    if (!user) {
      throw new NotFoundException(
        'Email is not registered. Please sign up to continue.',
      );
    }

    let isPasswordMatched =
      user.hash && (await argon.verify(user.hash, dto.password));

    if (!isPasswordMatched) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = await this.createToken(user, dto.remember);
    return {
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      ...token,
    };
  }

  async createToken(
    user: any,
    remember?: boolean,
  ): Promise<{ access_token: string }> {
    const payload = { email: user.email, sub: user.id };
    const access_token = await this.jwt.signAsync(payload, {
      secret: this.config.get('JWT_SECRET'),
      expiresIn: remember ? '30d' : '1d',
    });

    return {
      access_token,
    };
  }

  async googleLogin(req: any) {
    if (!req.user) {
      return 'No user from google';
    }

    const queryData = {
      email: req.user.email,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      picture: req.user.picture,
    };

    const oldUser = await this.usersDatabase.findUserByEmail(req.user.email);

    if (oldUser) {
      if (!oldUser.activeWorkspaceId) {
        const doesExist =
          await this.userWorkspaceDatabase.getSingleUserWorkspace({
            userId: oldUser.id,
            status: UserWorkspaceStatus.ACTIVE,
          });

        if (doesExist) {
          const updatedOldUser =
            doesExist.workspaceId &&
            (await this.usersDatabase.updateUser(oldUser, {
              activeWorkspaceId: doesExist.workspaceId,
            }));
          if (!updatedOldUser)
            throw new APIException(
              'Could not create user',
              HttpStatus.INTERNAL_SERVER_ERROR,
            );

          return await this.getFormattedUserData(updatedOldUser);
        }

        const workspace =
          oldUser.firstName &&
          (await this.workspacesService.createWorkspace(
            oldUser,
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

    const user = await this.usersDatabase.createGoogleLoginUser(queryData);
    // console.log(
    //   '🚀 ~ file: auth.service.ts:154 ~ AuthService ~ googleLogin ~ user:',
    //   user,
    // );
    if (!user)
      throw new APIException(
        'Could not create user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );

    const workspace =
      user &&
      user.firstName &&
      (await this.workspacesService.createWorkspace(
        user,
        `${user.firstName}'s Workspace`,
      ));

    if (!workspace)
      throw new APIException(
        'Could not create workspace',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );

    const updateUser =
      workspace &&
      (await this.usersDatabase.updateUser(user, {
        activeWorkspaceId: workspace.id,
      }));

    if (!updateUser)
      throw new APIException(
        'Could not update user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );

    return await this.getFormattedUserData(updateUser);
  }

  async getFormattedUserData(user: Partial<User>) {
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
    const decoded = this.jwt.verify(accessToken, {
      secret: this.config.get('JWT_SECRET'),
    });

    const user = await this.usersDatabase.findUniqueUser({ id: decoded.sub });

    return user as userDto;
  }

  async forgotPassword(reqBody: ForgotPasswordDto, req: Request) {
    const user = await this.usersDatabase.findUniqueUser({
      email: reqBody.email,
    });

    if (!user) {
      throw new APIException(
        'This email belong no user',
        HttpStatus.BAD_REQUEST,
      );
    }

    const resetToken = await this.generatePasswordResetToken(user.id);
    // console.log(
    //   '🚀 ~ file: auth.service.ts:266 ~ AuthService ~ forgotPassword ~ resetToken:',
    //   resetToken,
    // );

    const resetURL = `${req.protocol}://${req.headers.referer}resetPassword/${resetToken}`;
    // console.log(
    //   '🚀 ~ file: auth.service.ts:274 ~ AuthService ~ forgotPassword ~ resetURL:',
    //   resetURL,
    // );

    const message = `Forgot your password? Submit  a PATCH request with your new password and passwordConfirm to:
    ${resetURL}.\nIf you didn't forget your password. Please ignore this email`;
    try {
      await this.emailService.sendEmail(
        'Your password reset token (valid for 10 min)',
        message,
        user.email,
      );
      return { message: 'Successfully, token sent to the email' };
    } catch (err) {
      console.log(
        '🚀 ~ file: auth.service.ts:289 ~ AuthService ~ forgotPassword ~ err:',
        err,
      );
      user.passwordResetToken = null;
      user.passwordResetExpires = null;
      throw new APIException(
        'There is an error sending the email, please try again!',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  private async generatePasswordResetToken(userId: number) {
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    const resetExpires = new Date(Date.now() + 2 * 60 * 1000); // 10 minutes from now
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        passwordResetToken: hashedToken,
        passwordResetExpires: resetExpires,
      },
    });

    return resetToken;
  }

  async resetPassword(uniqueToken: string, reqBody: PasswordResetDto) {
    if (reqBody.password !== reqBody.confirmPassword) {
      throw new APIException(
        "Password and confirmPassword don't match",
        HttpStatus.NOT_ACCEPTABLE,
      );
    }
    const hashedToken = crypto
      .createHash('sha256')
      .update(uniqueToken)
      .digest('hex');

    const user = await this.usersDatabase.findUserByResetCredentials(
      hashedToken,
    );
    if (!user) {
      throw new APIException(
        'Token is invalid or has expired',
        HttpStatus.BAD_REQUEST,
      );
    }

    const updatedUser = await this.usersDatabase.updateUser(user, {
      hash: await argon.hash(reqBody.password),
      passwordResetToken: null,
      passwordResetExpires: null,
    });

    const token = await this.createToken(updatedUser);
    return {
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      ...token,
    };
  }
}
