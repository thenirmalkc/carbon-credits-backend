import { Prop, Schema } from '@nestjs/mongoose';
import { Transform, Type } from 'class-transformer';
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

  @Transform(({ value }: { value: unknown }) => {
    if (value && typeof value === 'string') {
      const date = new Date(value);
      date.setHours(0, 0, 0, 0);
      return date;
    }
    return value;
  })
  @IsDate()
  @Prop()
  creditingPeriodStart: Date;

  @Transform(({ value }: { value: unknown }) => {
    if (value && typeof value === 'string') {
      const date = new Date(value);
      date.setHours(0, 0, 0, 0);
      return date;
    }
    return value;
  })
  @IsDate()
  @Prop()
  creditingPeriodEnd: Date;

  @Transform(({ value }: { value: unknown }) => {
    if (value && typeof value === 'string') {
      const date = new Date(value);
      date.setHours(0, 0, 0, 0);
      return date;
    }
    return value;
  })
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
