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
import * as fs from 'fs';
import * as ejs from 'ejs';
import {
  ForgotPasswordDto,
  InvitedUserLoginDto,
  InvitedUserRegisterDto,
  LoginDto,
  PasswordResetDto,
  RegisterDto,
  RegisterSenOTPDto,
  userDto,
} from './dto';
import { User, UserStatus, UserWorkspaceStatus } from '@prisma/client';
import { Request } from 'express';
import * as crypto from 'crypto';
import { WorkspacesService } from '../workspaces/workspaces.service';
import { EmailService } from '../email/email.service';
import { APIException } from '../exception/api.exception';
import { PrismaService } from '../prisma/prisma.service';
import { UserWorkspaceDatabase } from 'src/database/userWorkspaces';
import { coreConfig } from 'config/core';

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

  private onboadingSteps: any[] = [
    {
      step: 'ACCESS_SELECTION',
      index: 1,
      completed: false,
      finalStep: false,
      optional: false,
    },
    {
      step: 'INVITATION',
      index: 2,
      completed: false,
      finalStep: true,
      optional: false,
    },
  ];

  async createUser(dto: RegisterDto) {
    try {
      const user = await this.usersDatabase.createUser({
        email: dto?.email,
        firstName: dto?.firstName,
        lastName: dto?.lastName,
        hash: await argon.hash(dto?.password),
        status: UserStatus.ONBOARD,
        onboadingSteps: [...this.onboadingSteps],
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

  async sendRegisterOTP(dto: RegisterSenOTPDto) {
    const { email, firstName, lastName } = dto;
    dto.email = email.toLowerCase();
    const doesExistUser = await this.usersDatabase.findUserByEmail(dto.email);
    if (doesExistUser) {
      throw new APIException('Email already in Use!', HttpStatus.BAD_REQUEST);
    }

    const code = `${Math.floor(Math.random() * 900000) + 100000}`;
    const expireTime = new Date();
    expireTime.setDate(expireTime.getMinutes() + 2);

    const doesExistUserOTP = await this.usersDatabase.getUserOTP(dto.email);
    const userOTPData = {
      email,
      code,
      expireTime,
    };

    let response = null;
    response = doesExistUserOTP
      ? await this.usersDatabase.updateUserOTP(email, userOTPData)
      : await this.usersDatabase.addUserOTP(userOTPData);

    if (!response) {
      throw new NotFoundException('Failed to send OTP for registration.');
    }

    const template = fs.readFileSync(
      'src/utils/htmlTemplates/email-confirmation.html',
      'utf8',
    );

    // send OTP registration code to email
    const name = `${firstName} ${lastName || ''}`;
    const html = ejs.render(template, { code, name });
    this.emailService.sendEmail('Email Confirmation Code', html, email);

    return {
      message:
        'Email confirmation code sent successfully. Please check your email and use the code to verify your account.',
    };
  }

  async register(dto: RegisterDto) {
    const email = dto?.email?.toLowerCase();
    dto.email = email;

    // Verify OTP Code
    const isOTPValid = await this.verifyOTP({ email, code: dto.code });
    if (!isOTPValid) {
      throw new APIException(
        'Invalid OTP code. Registration failed.',
        HttpStatus.BAD_REQUEST,
      );
    }

    let response = null;
    const doesExistUser = await this.getUser(dto);
    if (doesExistUser) {
      const userWorkspace =
        await this.userWorkspaceDatabase.getSingleUserWorkspace({
          userId: doesExistUser.id,
          status: UserWorkspaceStatus.INVITED,
        });
      if (userWorkspace) {
        response = await this.createInvitedUserRegularFlow(dto);
      } else {
        throw new APIException('Email already in Use!', HttpStatus.BAD_REQUEST);
      }
      // const token = await this.createToken(doesExistUser);
      // return { ...doesExistUser, ...token };
    }

    if (!response) response = await this.createUser(dto);
    this.usersDatabase.deleteUserOTP(email);
    return response;
  }

  private async verifyOTP(data: {
    email: string;
    code: string;
  }): Promise<boolean> {
    const { email, code } = data;

    // Fetch the user OTP data
    const userOTPData = await this.usersDatabase.getUserOTP(email);

    // Check if user OTP data exists and the provided OTP code matches
    if (userOTPData && userOTPData.code === code) {
      // Check if the OTP has not expired
      const currentDateTime = new Date();
      if (currentDateTime <= new Date(userOTPData.expireTime)) {
        return true; // OTP is valid and not expired
      }
    }

    return false; // Either OTP is invalid or expired
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
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      approved: user.approved,
      status: user.status,
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
      expiresIn: remember ? '30d' : '5d',
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

    if (oldUser?.firstName) {
      if (!oldUser?.activeWorkspaceId) {
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

    const user = oldUser
      ? await this.usersDatabase.updateGoogleLoginUser(queryData)
      : await this.usersDatabase.createGoogleLoginUser(queryData);
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

    const updateUser = invitationCode
      ? user
      : await this.usersDatabase.updateUser(user, {
          activeWorkspaceId: workspace.id,
        });
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
      status,
    } = user;
    return {
      id,
      firstName,
      lastName,
      email,
      picture,
      activeWorkspaceId,
      approved,
      status,
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
        'This email belongs to no user!',
        HttpStatus.BAD_REQUEST,
      );
    }

    const resetToken = await this.generatePasswordResetToken(user.id);
    // console.log(
    //   '🚀 ~ file: auth.service.ts:266 ~ AuthService ~ forgotPassword ~ resetToken:',
    //   resetToken,
    // );

    const resetURL = `${coreConfig.host_url}/resetPassword/${resetToken}`;
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
        onboadingSteps: [...this.onboadingSteps],
        status: UserStatus.ACTIVE,
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
      id: updatedUser.id,
      email: updatedUser.email,
      firstName: updatedUser.firstName,
      approved: updatedUser.approved,
      status: updatedUser.status,
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
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      approved: user.approved,
      status: user.status,
      ...(user?.lastName && { lastName: user?.lastName }),
      ...token,
    };
  }

  async checkEmail(code: string, reqEmail: string) {
    const userWorkspace = await this.userWorkspaceDatabase.checkEmail(code);
    if (!userWorkspace) {
      new APIException('Invalid code!', HttpStatus.BAD_REQUEST);
    }

    if (
      userWorkspace &&
      userWorkspace.user &&
      userWorkspace.user?.email === reqEmail
    ) {
      const updatedUserWorkspace =
        await this.userWorkspaceDatabase.updateUserWorkspace(
          Number(userWorkspace.id),
          {
            status: UserWorkspaceStatus.ACTIVE,
            respondedAt: new Date(Date.now()),
          },
        );
      if (!updatedUserWorkspace) {
        throw new APIException(
          'Can not accept invitation!',
          HttpStatus.BAD_REQUEST,
        );
      }

      const updatedUser = await this.usersDatabase.updateUser(
        { id: userWorkspace.user.id },
        {
          activeWorkspaceId: updatedUserWorkspace?.workspaceId,
        },
      );

      if (!updatedUser)
        throw new APIException('Could not update user', HttpStatus.BAD_REQUEST);
      return updatedUser;
    }
    throw new APIException(
      'Try to login with the same email!',
      HttpStatus.BAD_REQUEST,
    );
  }

  async createInvitedUserRegularFlow(data: RegisterDto) {
    //check if email is valid
    const isValidUser = await this.usersDatabase.findUserByEmail(data?.email);
    if (!isValidUser)
      throw new APIException('Email is not registered', HttpStatus.BAD_REQUEST);

    //check if requested email matches the email stored earlier in db
    const isEmailStored =
      await this.userWorkspaceDatabase.getSingleUserWorkspace({
        userId: isValidUser.id,
        status: UserWorkspaceStatus.INVITED,
      });

    if (!isEmailStored)
      throw new APIException(
        'Current email does not match with the invited email',
        HttpStatus.BAD_REQUEST,
      );

    const reqBody = {
      email: data?.email,
      firstName: data?.firstName,
      ...(data?.lastName && { lastName: data?.lastName }),
      hash: await argon.hash(data?.password),
      status: UserStatus.ACTIVE,
      onboadingSteps: [...this.onboadingSteps],
    };

    const updatedUser = await this.usersDatabase.updateUser(
      { id: isValidUser?.id },
      reqBody,
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
      status: updatedUser.status,
      ...(updatedUser?.lastName && { lastName: updatedUser?.lastName }),
      ...token,
    };
  }
}
