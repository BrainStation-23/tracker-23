import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { TokenError } from 'passport-oauth2';

@Catch(TokenError)
export class TokenErrorFilter implements ExceptionFilter {
  catch(exception: TokenError, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse();
    if (exception.message === 'authorization_code is invalid') {
      response.status(400).json({
        status: 401,
        message: 'Invalid authorization code',
      });
    } else {
      throw new HttpException('Unauthorized', 401);
    }
  }
}
