import { Prop, Schema } from '@nestjs/mongoose';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsEmail,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { TverProjectModelEnum, TverProjectSizeEnum } from '../project.enum';

@Schema({ _id: false })
class ContactPersonDetailsEntity {
  @IsString()
  @Prop()
  fullName: string;

  @IsString()
  @Prop()
  position: string;

  @IsString()
  @Prop()
  address: string;

  @IsEmail()
  @Prop()
  email: string;

  @IsString()
  @Prop()
  contactNumber: string;
}

@Schema({ _id: false })
class ProjectParticipantDetailsEntity {
  @IsString()
  @Prop()
  fullName: string;

  @IsString()
  @Prop()
  position: string;

  @IsString()
  @Prop()
  address: string;

  @IsEmail()
  @Prop()
  email: string;

  @IsString()
  @Prop()
  contactNumber: string;

  @IsString()
  @IsOptional()
  @Prop()
  fax?: string;

  @Type(() => ContactPersonDetailsEntity)
  @ValidateNested({ each: true })
  @Prop()
  contactPerson: ContactPersonDetailsEntity;
}

@Schema({ _id: false })
class ReporterDetailsEntity {
  @IsString()
  @Prop()
  fullName: string;

  @IsString()
  @Prop()
  position: string;

  @IsString()
  @Prop()
  organizationName: string;

  @IsEmail()
  @Prop()
  email: string;

  @IsString()
  @Prop()
  contactNumber: string;
}

@Schema({ _id: false })
export class TverProjectEntity {
  @Type(() => ProjectParticipantDetailsEntity)
  @IsArray()
  @ValidateNested({ each: true })
  @Prop()
  projectParticipants: ProjectParticipantDetailsEntity[];

  @Type(() => ProjectParticipantDetailsEntity)
  @IsArray()
  @ValidateNested({ each: true })
  @IsOptional()
  @Prop()
  coProjectParticipants?: ProjectParticipantDetailsEntity[];

  @IsString()
  @Prop()
  projectType: string;

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
  projectInvestmentCost: number; // in million Thai Baht

  @IsNumber()
  @Prop()
  estimatedGhgEmissionReductions: number; // 'Estimated Greenhouse Gas Emission Reductions/Removals' <amount of GHG emissions/removal> tCO2eq/y

  @IsNumber()
  @Prop()
  creditingPeriod: number;

  @Type(() => Date)
  @IsDate()
  @Prop()
  creditingPeriodStart: Date;

  @Type(() => Date)
  @IsDate()
  @Prop()
  creditingPeriodEnd: Date;

  @Type(() => Date)
  @IsDate()
  @Prop()
  finishDate: Date;

  @IsString()
  @Prop()
  version: string;

  @IsString()
  @Prop()
  vvbName: string; // Validation and Verification Body (VVB)

  @Type(() => ReporterDetailsEntity)
  @ValidateNested({ each: true })
  @Prop()
  reporter: ReporterDetailsEntity;
}
