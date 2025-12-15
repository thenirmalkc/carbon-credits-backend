import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from '../auth.service';
import { Reflector } from '@nestjs/core';
import { BYPASS_AUTH } from '../decorators/bypass-auth.decorator';
import { UserI } from '../../../common/types';
import { Types } from 'mongoose';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const handler = context.getHandler();
    const bypassAuth = this.reflector.get<boolean | undefined>(
      BYPASS_AUTH,
      handler,
    );
    if (bypassAuth) {
      return true;
    }
    const request = context
      .switchToHttp()
      .getRequest<Request & { user: UserI }>();
    const authorization = request.header('authorization');
    if (!authorization) {
      throw new HttpException('Unauthorized', 401);
    }
    const accessToken =
      authorization.split(' ')[1] || authorization.split(' ')[0];
    const user = await this.authService.jwtVerify<UserI>(
      accessToken,
      process.env.ACCESS_TOKEN_SECRET!,
    );
    user._id = new Types.ObjectId(user.id);
    request.user = user;
    return true;
  }
}
