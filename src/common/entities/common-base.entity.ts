import { Prop } from '@nestjs/mongoose';
import { ApiHideProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';
import { Transform } from 'class-transformer';
import { Allow } from 'class-validator';

export class CommonBaseEntity {
  @ApiHideProperty()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? new Types.ObjectId(value) : value,
  )
  @Allow()
  _id: Types.ObjectId;

  @ApiHideProperty()
  @Prop({ type: Date })
  deletedAt?: Date;
}
