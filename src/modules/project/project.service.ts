import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { TverPddDocument, TverPddEntity } from './entity/tver-pdd.entity';
import { Model } from 'mongoose';
import { CreateTVerPddIn } from './project.dto';

@Injectable()
export class ProjectService {
  constructor(
    @InjectModel(TverPddEntity.name)
    private readonly tverPddModel: Model<TverPddDocument>,
  ) {}

  createTverPdd(body: CreateTVerPddIn) {
    return this.tverPddModel.create(body);
  }
}
