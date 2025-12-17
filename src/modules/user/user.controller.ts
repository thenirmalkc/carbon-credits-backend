import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Put,
  HttpException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { RegisterUserIn, SeedAdminIn, UpdateUserIn } from './user.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BypassAuth } from '../auth/decorators/bypass-auth.decorator';
import { User } from '../auth/decorators/user.decorator';
import { UserI } from '../../common/types';
import { Roles } from '../auth/decorators/role.decorator';
import { UserRoleEnum } from './user.enum';
import { RoleGuard } from '../auth/guards/role.guard';

@ApiTags('User')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RoleGuard)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async getUserProfile(@User() user: UserI) {
    const userData = await this.userService.getUserProfile(user.id);
    if (!userData) {
      throw new HttpException('User not found', 404);
    }
    return userData;
  }

  @Roles(UserRoleEnum.ADMIN)
  @Get('admin-dashboard')
  getAdminDashboard() {
    return this.userService.getDashboard();
  }

  @Get('user-dashboard')
  getUserDashboard(@User() user: UserI) {
    return this.userService.getDashboard(user.id);
  }

  @Put()
  async updateUser(@Body() body: UpdateUserIn, @User() user: UserI) {
    const updated = await this.userService.updateUser(user.id, body);
    if (!updated) {
      throw new HttpException('Failed to update', 409);
    }
    return updated;
  }

  @BypassAuth()
  @Post('seed-admin')
  seedAdmin(@Body() body: SeedAdminIn) {
    return this.userService.seedAdmin(body);
  }

  @BypassAuth()
  @Post('register')
  async registerUser(@Body() body: RegisterUserIn) {
    const result = await this.userService.registerUser(body);
    return result;
  }
}
