import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserDocument, UserEntity } from './entity/user.entity';
import { RegisterDto } from './user.dto';
import * as bcrypt from 'bcrypt';
import { UserTypeEnum } from './user.enum';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(UserEntity.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async create(registerDto: RegisterDto): Promise<UserEntity> {
    // Check if user already exists
    const existingUser = await this.userModel
      .findOne({ email: registerDto.email })
      .exec();
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const userData = {
      name: registerDto.name,
      email: registerDto.email,
      password: hashedPassword,
      userType: registerDto.userType,
    };

    return this.userModel.create(userData);
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.userModel.findOne({ email: email.toLowerCase() }).exec();
  }

  async findById(id: string): Promise<UserEntity> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async validatePassword(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  async seedUsers() {
    const users = [
      {
        name: 'Admin',
        email: 'admin@gmail.com',
        password: 'Hello@123',
        userType: UserTypeEnum.ADMIN,
      },
      {
        name: 'Validator',
        email: 'validator@gmail.com',
        password: 'Hello@123',
        userType: UserTypeEnum.VALIDATOR,
      },
      {
        name: 'Seller',
        email: 'seller@gmail.com',
        password: 'Hello@123',
        userType: UserTypeEnum.SELLER,
      },
      {
        name: 'Buyer',
        email: 'buyer@gmail.com',
        password: 'Hello@123',
        userType: UserTypeEnum.BUYER,
      },
    ];
    for (const user of users) {
      const existingUser = await this.userModel
        .findOne({ email: user.email })
        .exec();
      if (!existingUser) {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        await this.userModel.create({ ...user, password: hashedPassword });
      }
    }
  }
}
