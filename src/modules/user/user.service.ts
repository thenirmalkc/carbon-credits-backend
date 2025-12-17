import { HttpException, Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model, PipelineStage, Types } from 'mongoose';
import { UserDocument, UserEntity } from './entity/user.entity';
import { RegisterUserIn, SeedAdminIn, UpdateUserIn } from './user.dto';
import { UserRoleEnum } from './user.enum';
import { AuthService } from '../auth/auth.service';
import { ProjectVerificationStatusEnum } from '../project/project.enum';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(UserEntity.name)
    private readonly userModel: Model<UserDocument>,
    private readonly authService: AuthService,
    @InjectConnection() private readonly mongoConn: Connection,
  ) {}

  async seedAdmin(body: SeedAdminIn) {
    const admin = await this.userModel.findOne({
      userRoles: UserRoleEnum.ADMIN,
    });
    if (admin) {
      throw new HttpException('Admin already exists', 409);
    }
    await this.userModel.create({
      ...body,
      userRoles: [UserRoleEnum.ADMIN],
    });
    return true;
  }

  async registerUser(body: RegisterUserIn) {
    const user = await this.userModel.create({
      ...body,
      userRoles: [UserRoleEnum.USER],
    });
    return this.authService.getLoginTokens(user);
  }

  findUserByEmail(
    email: string,
    selectedFields?: Partial<{ [k in keyof UserEntity]: 0 | 1 }>,
  ) {
    return this.userModel.findOne(
      {
        email: email.toLowerCase(),
        deletedAt: { $exists: false },
      },
      selectedFields || {},
    );
  }

  async getUserProfile(id: string) {
    const user = await this.userModel.findOne(
      {
        _id: id,
        deletedAt: { $exists: false },
      },
      { password: 0, __v: 0 },
    );
    return user;
  }

  async updateUser(id: string, body: UpdateUserIn) {
    const updated = await this.userModel.updateOne(
      {
        _id: id,
        deletedAt: { $exists: false },
      },
      { $set: body },
    );
    return updated.matchedCount;
  }

  async getDashboard(userId?: string) {
    const dashboard: Record<string, Record<string, number>> = {
      'Project verification status': { Total: 0 },
    };
    const userPipeline: PipelineStage[] = [];
    if (userId) {
      userPipeline.push({
        $match: { createdById: new Types.ObjectId(userId) },
      });
    }

    // -------------- project status ---------------------
    const pipeline: PipelineStage[] = [
      ...userPipeline,
      { $match: { deletedAt: { $exists: false } } },
      {
        $group: {
          _id: {
            $ifNull: [
              '$verificationStatus',
              ProjectVerificationStatusEnum.PENDING,
            ],
          },
          total: { $sum: 1 },
        },
      },
    ];
    const projectStatuses = await this.mongoConn
      .collection('project')
      .aggregate<{ _id: string; total: number }>(pipeline)
      .toArray();
    for (const status of Object.values<string>(ProjectVerificationStatusEnum)) {
      dashboard['Project verification status'][status] =
        projectStatuses.find((x) => x._id === status)?.total || 0;
      dashboard['Project verification status']['Total'] +=
        dashboard['Project verification status'][status];
    }
    // xxxxxxxxxxxxxxxx project status xxxxxxxxxxxxxxxx

    return dashboard;
  }
}
