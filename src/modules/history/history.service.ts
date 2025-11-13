import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { HistoryDocument, HistoryEntity } from './entity/history.entity';
import { Model, Types } from 'mongoose';
import { GetHistoryQueryDto, UpdateHistoryStatusDto } from './history.dto';
import { HistoryStatusEnum } from './history.enum';

@Injectable()
export class HistoryService {
  constructor(
    @InjectModel(HistoryEntity.name)
    private readonly historyModel: Model<HistoryDocument>,
  ) {}

  createHistory(body: HistoryEntity[]) {
    return this.historyModel.create(body);
  }

  async getHistory(filter: GetHistoryQueryDto) {
    const matchStage: Record<string, any> = {};
    if (filter.userAddress) {
      matchStage['userAddress'] = filter.userAddress;
    }
    if (filter.action) {
      matchStage['action'] = filter.action;
    }
    if (filter.status === HistoryStatusEnum.PENDING) {
      matchStage.$or = [
        { status: HistoryStatusEnum.PENDING },
        { status: { $exists: false } },
      ];
    } else if (filter.status) {
      matchStage['status'] = filter.status;
    }
    const total = await this.historyModel.countDocuments(matchStage);
    const items = await this.historyModel.aggregate<HistoryEntity>([
      { $match: matchStage },
      { $sort: { [filter.sortBy]: filter.order } },
      {
        $project: {
          _id: 1,
          createdAt: 1,
          network: 1,
          userAddress: 1,
          action: 1,
          txnHash: 1,
          amount: 1,
          status: 1,
          tokenName: 1,
          tokenSymbol: 1,
          tokenDecimal: 1,
        },
      },
      { $skip: filter.offset },
      { $limit: filter.limit },
    ]);
    return { total, items };
  }

  async updateHistoryStatus(id: string, body: UpdateHistoryStatusDto) {
    const updated = await this.historyModel.updateOne(
      { _id: new Types.ObjectId(id) },
      { $set: { status: body.status } },
    );
    return updated.modifiedCount;
  }
}
