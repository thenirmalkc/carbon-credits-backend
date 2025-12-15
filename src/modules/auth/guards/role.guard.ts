import {
  CanActivate,
  ExecutionContext,
  HttpException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { BYPASS_AUTH } from '../decorators/bypass-auth.decorator';
import { UserI } from '../../../common/types';
import { UserRoleEnum } from '../../user/user.enum';
import { ROLES } from '../decorators/role.decorator';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
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
    const { user } = request;
    if (!user) {
      throw new HttpException('Auth guard is required', 401);
    }
    const allowedRoles = this.reflector.get<UserRoleEnum[] | undefined>(
      ROLES,
      handler,
    );
    if (allowedRoles) {
      const flag = allowedRoles.find((allowedRole) =>
        user.userRoles.includes(allowedRole),
      );
      if (!flag) {
        throw new HttpException('Forbidden', 403);
      }
    }
    return true;
  }
}
