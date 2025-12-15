import { IsEmail, IsString } from 'class-validator';
import { UserEntity } from './entity/user.entity';
import { OmitType, PartialType, PickType } from '@nestjs/swagger';

export class RegisterUserIn extends PickType(UserEntity, [
  'firstName',
  'lastName',
  'email',
  'password',
] as const) {}

export class SeedAdminIn {
  @IsString()
  firstName: string = 'Nirmal';

  @IsString()
  lastName: string = 'KC';

  @IsEmail()
  email: string = 'admin@admin.com';

  @IsString()
  password: string = 'password';
}

export class UpdateUserIn extends PartialType(
  OmitType(UserEntity, [
    '_id',
    'email',
    'password',
    'userRoles',
    'fullName',
  ] as const),
) {}
