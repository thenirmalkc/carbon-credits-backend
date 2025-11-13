import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { HistoryDocument, HistoryEntity } from './entity/history.entity';
import { Model } from 'mongoose';
import { GetHistoryQueryDto } from './history.dto';

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
        },
      },
      { $skip: filter.offset },
      { $limit: filter.limit },
    ]);
    return { total, items };
  }
}
