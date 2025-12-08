import { Module } from '@nestjs/common';
import { ProjectController } from './project.controller';
import { ProjectService } from './project.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
  TverProjectEntity,
  TverProjectSchema,
} from './entity/tver-project.entity';
import { OpenaiService } from '../../common/openai.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TverProjectEntity.name, schema: TverProjectSchema },
    ]),
  ],
  controllers: [ProjectController],
  providers: [ProjectService, OpenaiService],
})
export class ProjectModule {}
