import { Prop } from '@nestjs/mongoose';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';
import { ForeignKey } from '../dtos/foreign-key.dto';
import { Transform } from 'class-transformer';
import { Allow } from 'class-validator';

export class CommonBaseEntity {
  @ApiProperty(ForeignKey)
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? new Types.ObjectId(value) : value,
  )
  @Allow()
  _id: Types.ObjectId;

  @ApiHideProperty()
  @Prop({ type: Date })
  deletedAt?: Date;
}
