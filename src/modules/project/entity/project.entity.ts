import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { CommonBaseEntity } from '../../../common/entities/common-base.entity';
import { HydratedDocument, Types } from 'mongoose';
import {
  ProjectStandardEnum,
  ProjectTypeEnum,
  ProjectVerificationStatusEnum,
} from '../project.enum';
import {
  Allow,
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsEmail,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { ApiHideProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { TverProjectEntity } from './tver-project.entity';
import { ProjectDocumentsEntity } from './project-document.entity';

@Schema({ _id: false })
class ProjectOwnerEntity {
  @IsString()
  @Prop()
  fullName: string;

  @IsString()
  @Prop()
  fullAddress: string;

  @IsString()
  @Prop()
  contactNumber: string;

  @IsEmail()
  @Prop()
  email: string;
}

class PointCoordinatesEntity {
  @ApiHideProperty()
  @Prop({
    type: String,
    enum: ['Point'],
    required: true,
    default: 'Point',
  })
  type: 'Point';

  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(2)
  @IsNumber({}, { each: true })
  @Prop()
  coordinates: number[];
}

@Schema({ _id: false })
class ProjectLocationEntity {
  @IsString()
  @Prop()
  country: string;

  @IsString()
  @Prop()
  state: string;

  @IsString()
  @Prop()
  city: string;

  @Type(() => PointCoordinatesEntity)
  @ValidateNested()
  @Prop()
  location: PointCoordinatesEntity;
}

@Schema({ timestamps: true, collection: 'project' })
export class ProjectEntity extends CommonBaseEntity {
  // ----------- metadata -----------
  @IsEnum(ProjectTypeEnum)
  @Prop()
  projectType: ProjectTypeEnum;

  @IsEnum(ProjectStandardEnum)
  @Prop()
  projectStandard: ProjectStandardEnum;

  @ApiHideProperty()
  @Prop()
  standardYear: string;
  // --------------------------------

  @Prop()
  projectId: string; // auto generate project id

  @IsString()
  @Prop()
  projectTitle: string;

  @IsString()
  @IsOptional()
  @Prop()
  additionalInfo?: string;

  @Prop({ type: Number, default: 0 })
  carbonCredits: number; // total number of carbon credits received

  @IsString()
  @Prop({ default: '<div>Product Development Document</div>' })
  pddTemplate?: string; // html content here

  @Prop()
  verifiedAt?: Date;

  @Prop()
  verifiedById: Types.ObjectId;

  @ApiHideProperty()
  @IsEnum(ProjectVerificationStatusEnum)
  @Prop({ default: ProjectVerificationStatusEnum.PENDING })
  verificationStatus: ProjectVerificationStatusEnum;

  @Type(() => ProjectOwnerEntity)
  @IsArray()
  @ValidateNested({ each: true })
  @Prop()
  projectOwners: ProjectOwnerEntity[];

  @Type(() => ProjectLocationEntity)
  @IsArray()
  @ValidateNested({ each: true })
  @Prop()
  locations: ProjectLocationEntity[];

  @Type(() => TverProjectEntity)
  @ValidateNested({ each: true })
  @Prop()
  tver: TverProjectEntity;

  @ApiHideProperty()
  @Allow()
  @Prop()
  createdById: Types.ObjectId;

  @ApiHideProperty()
  @Allow()
  @Prop()
  updatedById?: Types.ObjectId;

  // relations
  documents: ProjectDocumentsEntity[];
}

export type ProjectDocument = HydratedDocument<ProjectEntity>;
export const ProjectSchema = SchemaFactory.createForClass(ProjectEntity);

ProjectSchema.index({ projectTitle: 'text' }, { weights: { projectTitle: 1 } });
