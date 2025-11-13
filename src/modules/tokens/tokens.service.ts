import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { TokenDocument, TokenEntity } from './entity/token.entity';
import { Model } from 'mongoose';
import {
  CreateTokenDto,
  GetTokensQueryDto,
  UpdateTokenDto,
} from './tokens.dto';

@Injectable()
export class TokensService {
  constructor(
    @InjectModel(TokenEntity.name)
    private readonly tokenModel: Model<TokenDocument>,
  ) {}

  async create(createTokenDto: CreateTokenDto): Promise<TokenEntity> {
    const tokenData = {
      serialNumbers: createTokenDto.serialNumbers,
      count: createTokenDto.serialNumbers.length,
      status: createTokenDto.status || 'pending',
      walletAddress: createTokenDto.walletAddress || '',
    };
    return this.tokenModel.create(tokenData);
  }

  async findAll(filter: GetTokensQueryDto) {
    const matchStage: Record<string, any> = {};

    if (filter.status) {
      matchStage['status'] = filter.status;
    }

    if (filter.walletAddress) {
      matchStage['walletAddress'] = filter.walletAddress;
    }

    const total = await this.tokenModel.countDocuments(matchStage);
    const items = await this.tokenModel.aggregate<TokenEntity>([
      { $match: matchStage },
      { $sort: { [filter.sortBy]: filter.order } },
      {
        $project: {
          _id: 1,
          serialNumbers: 1,
          count: 1,
          status: 1,
          walletAddress: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      },
      { $skip: filter.offset },
      { $limit: filter.limit },
    ]);

    return { total, items };
  }

  async findOne(id: string): Promise<TokenEntity> {
    const token = await this.tokenModel.findById(id).exec();
    if (!token) {
      throw new NotFoundException(`Token with ID ${id} not found`);
    }
    return token;
  }

  async update(
    id: string,
    updateTokenDto: UpdateTokenDto,
  ): Promise<TokenEntity> {
    const updateData: any = {};

    if (updateTokenDto.serialNumbers !== undefined) {
      updateData.serialNumbers = updateTokenDto.serialNumbers;
      updateData.count = updateTokenDto.serialNumbers.length;
    }

    if (updateTokenDto.status !== undefined) {
      updateData.status = updateTokenDto.status;
    }

    if (updateTokenDto.walletAddress !== undefined) {
      updateData.walletAddress = updateTokenDto.walletAddress;
    }

    const updatedToken = await this.tokenModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();

    if (!updatedToken) {
      throw new NotFoundException(`Token with ID ${id} not found`);
    }

    return updatedToken;
  }

  async remove(id: string): Promise<void> {
    const result = await this.tokenModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Token with ID ${id} not found`);
    }
  }
}
