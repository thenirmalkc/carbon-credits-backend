import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { LoginDto } from '../user/user.dto';
import { LoginResponseDto } from './auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await this.userService.validatePassword(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const userObj = (user as any).toObject ? (user as any).toObject() : JSON.parse(JSON.stringify(user));
    const { password: _, ...result } = userObj;
    return result;
  }

  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    
    const payload = { 
      email: user.email, 
      userId: user._id.toString(),
      userType: user.userType 
    };
    
    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        userType: user.userType,
      },
    };
  }
}

