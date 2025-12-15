import { IsEmail, IsString } from 'class-validator';

export class LoginIn {
  @IsEmail()
  email: string = 'admin@admin.com';

  @IsString()
  password: string = 'password';
}
