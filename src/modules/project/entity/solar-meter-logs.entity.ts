import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiHideProperty } from '@nestjs/swagger';
import { Allow, IsDate, IsNumber } from 'class-validator';
import { HydratedDocument, Types } from 'mongoose';
import { CommonBaseEntity } from 'src/common/entities/common-base.entity';

@Schema({ timestamps: true, collection: 'solar_meter_logs' })
export class SolarMeterLogsEntity extends CommonBaseEntity {
  @IsDate()
  @Prop()
  date: Date;

  @IsNumber()
  @Prop()
  totalProduction: number; // kWh

  @IsNumber()
  @Prop()
  onPeakProduction: number; // kWh

  @IsNumber()
  @Prop()
  offPeakProduction: number; // kWh

  @Allow()
  @Prop()
  projectId: Types.ObjectId;

  @Allow()
  @Prop()
  createdById: Types.ObjectId;

  @ApiHideProperty()
  carbonCredits: number;
}

export type SolarMeterLogsDocument = HydratedDocument<SolarMeterLogsEntity>;
export const SolarMeterLogsSchema =
  SchemaFactory.createForClass(SolarMeterLogsEntity);

SolarMeterLogsSchema.index(
  { projectTitle: 'text' },
  { weights: { projectTitle: 1 } },
);
