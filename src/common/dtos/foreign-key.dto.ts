import { ApiPropertyOptions } from '@nestjs/swagger';
import { Types } from 'mongoose';

export const ForeignKey: ApiPropertyOptions = {
  type: 'string',
  example: new Types.ObjectId().toString(),
};
