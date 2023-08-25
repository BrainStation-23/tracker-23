import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class RolesGuard extends AuthGuard('jwt') {
  constructor(private roles: string[] | null) {
    super();
  }

  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: string) {
    console.log(
      '🚀 ~ file: auth.guard.ts:19 ~ RolesGuard ~ handleRequest ~ user:',
      user,
    );

    if (!this.roles) {
      return user || null;
    }

    if (!user) {
      throw new UnauthorizedException(
        'Sorry! You are not a valid user for this action.',
      );
    }

    const role = user.role;
    const doesRoleMatch = this.roles.some((r) => r === role);
    if (!doesRoleMatch) {
      throw new UnauthorizedException(
        'Sorry! You are not a valid user for this action.',
      );
    }
    return user;
  }
}
