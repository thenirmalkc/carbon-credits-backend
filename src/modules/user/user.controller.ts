import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
} from '@nestjs/common';
import { UserService } from './user.service';
import { RegisterDto, UserResponseDto } from './user.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 409, description: 'User already exists' })
  async register(@Body() registerDto: RegisterDto): Promise<UserResponseDto> {
    const user = await this.userService.create(registerDto);
    // Exclude password from response
    const userObj = (user as any).toObject
      ? (user as any).toObject()
      : JSON.parse(JSON.stringify(user));
    const { password, ...userResponse } = userObj;
    return userResponse as UserResponseDto;
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: 200,
    description: 'Returns user profile',
    type: UserResponseDto,
  })
  async getProfile(@Request() req): Promise<UserResponseDto> {
    const user = await this.userService.findById(req.user.userId);
    const userObj = (user as any).toObject
      ? (user as any).toObject()
      : JSON.parse(JSON.stringify(user));
    const { password, ...userResponse } = userObj;
    return userResponse as UserResponseDto;
  }
}
