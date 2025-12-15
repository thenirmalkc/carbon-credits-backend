import { forwardRef, HttpException, Inject, Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { LoginIn } from './auth.dto';
import bcrypt from 'bcrypt';
import { UserEntity } from '../user/entity/user.entity';
import jwt, { SignOptions, VerifyOptions } from 'jsonwebtoken';
import { StringValue } from 'ms';

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
  ) {}

  async loginUser(body: LoginIn) {
    const user = await this.userService.findUserByEmail(body.email, {
      _id: 1,
      email: 1,
      userRoles: 1,
      password: 1,
    });
    if (!user) {
      throw new HttpException('User not found', 404);
    }
    const isValid = await bcrypt.compare(body.password, user.password);
    if (!isValid) {
      throw new HttpException('Invalid password', 400);
    }
    return this.getLoginTokens(user);
  }

  async getLoginTokens(user: UserEntity) {
    const refreshToken = await this.jwtSign(
      {
        id: user._id.toString(),
        email: user.email,
        userRoles: user.userRoles,
      },
      process.env.REFRESH_TOKEN_SECRET!,
      { expiresIn: <StringValue>process.env.REFRESH_TOKEN_EXP_IN! },
    );
    const accessToken = await this.jwtSign(
      {
        id: user._id.toString(),
        email: user.email,
        userRoles: user.userRoles,
      },
      process.env.ACCESS_TOKEN_SECRET!,
      { expiresIn: <StringValue>process.env.ACCESS_TOKEN_EXP_IN! },
    );
    return {
      refreshToken,
      accessToken,
      userRoles: user.userRoles,
    };
  }

  jwtSign(
    payload: Record<string, unknown>,
    secret: string,
    options: SignOptions,
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      jwt.sign(payload, secret, options, (err, token) => {
        if (err) reject(err);
        else if (token) resolve(token);
        else reject(new Error('Jwt sign error'));
      });
    });
  }

  jwtVerify<T>(
    token: string,
    secret: string,
    options: VerifyOptions = {},
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      jwt.verify(token, secret, options, (err, payload) => {
        if (err) reject(err);
        else if (payload) resolve(payload as T);
        else reject(new Error('Jwt verify error'));
      });
    });
  }
}
