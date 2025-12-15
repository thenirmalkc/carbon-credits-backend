import { SetMetadata } from '@nestjs/common';
import { UserRoleEnum } from '../../user/user.enum';

export const ROLES = 'ROLES';
export const Roles = (...allowedRoles: UserRoleEnum[]) =>
  SetMetadata(ROLES, allowedRoles);
