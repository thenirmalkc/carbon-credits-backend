import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Allow, IsEnum, IsOptional, IsString } from 'class-validator';
import { HydratedDocument, Types } from 'mongoose';
import { PorjectFileTypeEnum } from '../project.enum';
import { CommonBaseEntity } from '../../../common/entities/common-base.entity';
import { ApiHideProperty } from '@nestjs/swagger';

@Schema({ timestamps: true, collection: 'project_documents' })
export class ProjectDocumentsEntity extends CommonBaseEntity {
  @IsString()
  @Prop()
  filePath: string;

  @IsEnum(PorjectFileTypeEnum)
  @Prop()
  fileType: PorjectFileTypeEnum;

  @IsString()
  @IsOptional()
  @Prop()
  userDescription?: string;

  @Prop()
  isProcessed: boolean;

  // ----------- metadata -----------
  @Prop()
  aiTitle: string; // later populated by llm

  @Prop()
  aiSummary: string; // later populated by llm

  @Prop()
  content: string; // file content here
  // ---------------------------------

  @Prop()
  projectId?: Types.ObjectId;

  @ApiHideProperty()
  @Allow()
  @Prop()
  createdById: Types.ObjectId;

  @Allow()
  @Prop()
  updatedById?: Types.ObjectId;
}

export type ProjectDocumentsDocument = HydratedDocument<ProjectDocumentsEntity>;
export const ProjectDocumentsSchema = SchemaFactory.createForClass(
  ProjectDocumentsEntity,
);
