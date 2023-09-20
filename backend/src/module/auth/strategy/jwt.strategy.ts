import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/module/prisma/prisma.service';
import { APIException } from 'src/module/exception/api.exception';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private config: ConfigService, private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        activeWorkspaceId: true,
      },
    });

    if (!user) {
      throw new APIException(
        'Sorry! You are not a valid user for this action.',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const userWorkspace =
      user.activeWorkspaceId &&
      (await this.prisma.userWorkspace.findFirst({
        where: {
          userId: user.id,
          workspaceId: user.activeWorkspaceId,
        },
        select: {
          role: true,
        },
      }));

    return { ...user, userWorkspace };
  }
}
