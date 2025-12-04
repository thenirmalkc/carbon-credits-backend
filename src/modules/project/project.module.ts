import { Module } from '@nestjs/common';
import { ProjectController } from './project.controller';
import { ProjectService } from './project.service';
import { MongooseModule } from '@nestjs/mongoose';
import { TverPddEntity, TverPddSchema } from './entity/tver-pdd.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TverPddEntity.name, schema: TverPddSchema },
    ]),
  ],
  controllers: [ProjectController],
  providers: [ProjectService],
})
export class ProjectModule {}
