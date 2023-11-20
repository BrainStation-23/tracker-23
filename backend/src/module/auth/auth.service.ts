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
  InvitedUserLoginDto,
  InvitedUserRegisterDto,
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
      if (!workspace) {
        throw new APIException(
          'Can not create user!',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      const updateUser = await this.usersDatabase.updateUser(user, {
        activeWorkspaceId: workspace.id,
      });
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

    const isPasswordMatched =
      user.hash && (await argon.verify(user.hash, dto.password));

    if (!isPasswordMatched) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = await this.createToken(user, dto.remember);
    return {
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      approved: user.approved,
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
    const urlParams = new URLSearchParams(req.url);
    const invitationCode = urlParams.get('invitationCode');
    invitationCode && (await this.checkEmail(invitationCode, req.user.email));

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
    const {
      id,
      firstName,
      lastName,
      email,
      picture,
      activeWorkspaceId,
      approved,
    } = user;
    return {
      id,
      firstName,
      lastName,
      email,
      picture,
      activeWorkspaceId,
      approved,
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

  async createInvitedUser(data: InvitedUserRegisterDto) {
    //check if email is valid
    const isValidUser = await this.usersDatabase.findUserByEmail(data?.email);
    if (!isValidUser)
      throw new APIException('Email is not registered', HttpStatus.BAD_REQUEST);

    //check if requested email matches the email stored earlier in db
    const isEmailStored =
      await this.userWorkspaceDatabase.getSingleUserWorkspace({
        invitationId: data?.code,
        status: UserWorkspaceStatus.INVITED,
        userId: isValidUser.id,
      });

    if (!isEmailStored)
      throw new APIException(
        'Current email does not match with the invited email',
        HttpStatus.BAD_REQUEST,
      );

    const updatedUser = await this.usersDatabase.updateUser(
      { id: isValidUser?.id },
      {
        hash: await argon.hash(data?.password),
        firstName: data?.firstName,
        ...(data?.lastName && { lastName: data?.lastName }),
      },
    );

    if (!updatedUser)
      throw new APIException(
        'Could not create user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    const workspace =
      updatedUser &&
      updatedUser.firstName &&
      (await this.workspacesService.createWorkspace(
        updatedUser,
        `${updatedUser.firstName}'s Workspace`,
        false,
      ));

    if (!workspace) {
      throw new APIException(
        'Can not create user!',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    //update invited userworkspace
    const updatedUserWorkspace =
      await this.userWorkspaceDatabase.updateUserWorkspace(
        Number(isEmailStored.id),
        {
          status: UserWorkspaceStatus.ACTIVE,
          respondedAt: new Date(Date.now()),
        },
      );

    if (!updatedUserWorkspace)
      throw new APIException(
        'Could not update userWorkspace. Invalid ID',
        HttpStatus.BAD_REQUEST,
      );

    const token = await this.createToken({
      id: isValidUser.id,
      email: isValidUser.email,
      firstName: data.firstName,
      ...(data?.lastName && { lastName: data?.lastName }),
    });

    return {
      email: updatedUser.email,
      firstName: updatedUser.firstName,
      approved: updatedUser.approved,
      ...(updatedUser?.lastName && { lastName: updatedUser?.lastName }),
      ...token,
    };
  }

  async loginInvitedUser(data: InvitedUserLoginDto) {
    const user = await this.usersDatabase.findUserWithHash(data);

    if (!user) {
      throw new NotFoundException(
        'Email is not registered. Please sign up to continue.',
      );
    }

    const isPasswordMatched =
      user.hash && (await argon.verify(user.hash, data.password));

    if (!isPasswordMatched) {
      throw new UnauthorizedException('Invalid credentials');
    }

    //check if requested email matches the email stored earlier in db
    const isEmailStored =
      await this.userWorkspaceDatabase.getSingleUserWorkspace({
        invitationId: data?.code,
        status: UserWorkspaceStatus.INVITED,
        userId: user.id,
      });

    if (!isEmailStored)
      throw new APIException(
        'Current email does not match with the invited email',
        HttpStatus.BAD_REQUEST,
      );

    //update invited userworkspace
    const updatedUserWorkspace =
      await this.userWorkspaceDatabase.updateUserWorkspace(
        Number(isEmailStored.id),
        {
          status: UserWorkspaceStatus.ACTIVE,
          respondedAt: new Date(Date.now()),
        },
      );

    if (!updatedUserWorkspace)
      throw new APIException(
        'Could not update userWorkspace. Invalid ID',
        HttpStatus.BAD_REQUEST,
      );

    const updatedUser = await this.usersDatabase.updateUser(
      { id: user?.id },
      {
        activeWorkspaceId: updatedUserWorkspace?.workspaceId,
      },
    );

    if (!updatedUser)
      throw new APIException(
        'Could not create user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );

    const token = await this.createToken({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      ...(user?.lastName && { lastName: user?.lastName }),
    });

    return {
      email: user.email,
      firstName: user.firstName,
      approved: user.approved,
      ...(user?.lastName && { lastName: user?.lastName }),
      ...token,
    };
  }

  async checkEmail(code: string, reqEmail: string) {
    const user = await this.userWorkspaceDatabase.checkEmail(code);
    if (!user) {
      new APIException('Invalid code!', HttpStatus.BAD_REQUEST);
    }

    if (user?.email === reqEmail) return user;
    throw new APIException(
      'Try to login with the same email!',
      HttpStatus.BAD_REQUEST,
    );
  }
}
