import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as argon from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoginDto, RegisterDto, userDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
    private jwt: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const hashedPassword = await argon.hash(dto.password);

    const data = {
      email: dto.email,
      firstName: dto.firstName,
      lastName: dto.lastName,
      hash: hashedPassword,
    };
    const user = await this.prisma.user.create({
      data,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
      },
    });
    const token = await this.createToken(user);
    return { ...user, ...token };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
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
    console.log('User information from google');
    const queryData = {
      email: req.user.email,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      picture: req.user.picture,
    };
    const oldUser = await this.prisma.user.findUnique({
      where: { email: req.user.email },
    });
    if (oldUser) {
      console.log('Old User Found');
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
    return await this.getFormattedUserData(user);
  }

  async getFormattedUserData(user: userDto) {
    const token = await this.createToken(user);
    const { id, firstName, lastName, email, picture } = user;
    return {
      id,
      firstName,
      lastName,
      email,
      picture,
      ...token,
    };
  }
}
