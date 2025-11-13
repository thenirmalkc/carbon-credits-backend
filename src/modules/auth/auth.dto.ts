import { ApiProperty } from '@nestjs/swagger';

export class LoginResponseDto {
  @ApiProperty({ description: 'JWT access token' })
  accessToken: string;

  @ApiProperty({ description: 'User information' })
  user: {
    _id: string;
    name: string;
    email: string;
    userType: string;
  };
}

