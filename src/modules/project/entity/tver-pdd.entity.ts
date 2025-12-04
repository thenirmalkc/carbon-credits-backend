import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsEnum,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { HydratedDocument } from 'mongoose';
import { PROJECT_TYPES } from '../project.constant';
import {
  TverCreditingPeriodYearsEnum,
  TverProjectModelEnum,
  TverProjectSizeEnum,
} from '../project.enum';

@Schema({ _id: false })
export class ProjectParticipantEntity {
  @IsString()
  @Prop()
  projectParticipantName: string;

  @IsString()
  @Prop()
  contactPerson: string;

  @IsString()
  @Prop()
  position: string;

  @IsString()
  @Prop()
  address: string;

  @IsString()
  @Prop()
  telephone: string;

  @IsString()
  @Prop()
  fax: string;

  @IsString()
  @Prop()
  email: string;
}

export type ProjectParticipantDocument =
  HydratedDocument<ProjectParticipantEntity>;
export const ProjectParticipantSchema = SchemaFactory.createForClass(
  ProjectParticipantEntity,
);

@Schema({ _id: false })
export class ReporterDetailEntity {
  @IsString()
  @Prop()
  name: string;

  @IsString()
  @Prop()
  position: string;

  @IsString()
  @Prop()
  organization: string;

  @IsString()
  @Prop()
  telephone: string;
}

export type ReporterDetailDocument = HydratedDocument<ReporterDetailEntity>;
export const ReporterDetailSchema =
  SchemaFactory.createForClass(ReporterDetailEntity);

@Schema({ _id: false })
export class TverPddDocsEntity {
  @IsString()
  @Prop()
  filePath: string;

  @IsString()
  @Prop()
  documentType: string;
}

export type TverPddDocsDocument = HydratedDocument<TverPddDocsEntity>;
export const TverPddDocsSchema =
  SchemaFactory.createForClass(TverPddDocsEntity);

@Schema({ timestamps: true, collection: 'tver_pdd' })
export class TverPddEntity {
  // --- Project Details ---
  @IsString()
  @Prop()
  projectTitle: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProjectParticipantEntity)
  @Prop()
  projectParticipants: ProjectParticipantEntity[];

  @IsArray()
  @ValidateNested({ each: true })
  @IsOptional()
  @Type(() => ProjectParticipantEntity)
  @Prop({ default: [] })
  coProjectParticipants?: ProjectParticipantEntity[];

  @IsString()
  @Prop()
  projectOwner: string;

  @IsString()
  @Prop()
  projectLocation: string;

  @IsString()
  @Prop()
  coordinates: string;

  @IsIn(PROJECT_TYPES)
  @Prop()
  projectType: string = PROJECT_TYPES[0];

  @IsString()
  @Prop()
  projectTypeOther: string;

  @IsEnum(TverProjectModelEnum)
  @Prop()
  projectModel: TverProjectModelEnum;

  @IsEnum(TverProjectSizeEnum)
  @Prop()
  projectSize: TverProjectSizeEnum;

  @IsString()
  @Prop()
  tverMethodologyAndTools: string;

  @IsString()
  @Prop()
  projectActivitySummary: string;

  @IsNumber()
  @Prop()
  projectInvestmentCost: number; // In million Thai Baht

  @IsNumber()
  @Prop()
  estimatedGhgEmissionReductions: number; // 'Estimated Greenhouse Gas Emission Reductions/Removals' <amount of GHG emissions/removal> tCO2eq/y

  // --- Crediting Period ---
  @IsEnum(TverCreditingPeriodYearsEnum)
  @Prop()
  creditingPeriodYears: TverCreditingPeriodYearsEnum;

  @IsDate()
  @Transform(({ value }) => {
    let date: Date;
    if (typeof value === 'string') {
      date = new Date(value);
    } else {
      date = new Date();
    }
    date.setUTCHours(0, 0, 0, 0);
    return date;
  })
  @Prop()
  creditingPeriodStart: Date;

  @IsDate()
  @Transform(({ value }) => {
    let date: Date;
    if (typeof value === 'string') {
      date = new Date(value);
    } else {
      date = new Date();
    }
    date.setUTCHours(0, 0, 0, 0);
    return date;
  })
  @Prop()
  creditingPeriodEnd: Date;

  // --- Details of Report Preparation ---
  @IsDate()
  @Transform(({ value }) => {
    let date: Date;
    if (typeof value === 'string') {
      date = new Date(value);
    } else {
      date = new Date();
    }
    date.setUTCHours(0, 0, 0, 0);
    return date;
  })
  @Prop()
  finishDate: Date;

  @IsString()
  @Prop()
  version: string;

  @ValidateNested()
  @Type(() => ReporterDetailEntity)
  @Prop()
  reporter: ReporterDetailEntity;

  // --- Validation and Verification Body (VVB) ---
  @IsString()
  @Prop()
  vvbName: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TverPddDocsEntity)
  @Prop({ default: [] })
  docs?: TverPddDocsEntity[];
}

export type TverPddDocument = HydratedDocument<TverPddEntity>;
export const TverPddSchema = SchemaFactory.createForClass(TverPddEntity);
