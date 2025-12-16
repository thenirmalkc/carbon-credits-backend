import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProjectEntity, ProjectSchema } from './entity/project.entity';
import { ProjectController } from './project.controller';
import { ProjectService } from './project.service';
import { AuthModule } from '../auth/auth.module';
import {
  ProjectDocumentsEntity,
  ProjectDocumentsSchema,
} from './entity/project-document.entity';
import { FileUploadModule } from '../file-upload/file-upload.module';
import { OpenaiService } from 'src/common/services/openai.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ProjectEntity.name, schema: ProjectSchema },
      { name: ProjectDocumentsEntity.name, schema: ProjectDocumentsSchema },
    ]),
    AuthModule,
    FileUploadModule,
  ],
  controllers: [ProjectController],
  providers: [ProjectService, OpenaiService],
})
export class ProjectModule {}
