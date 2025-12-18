import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  Max,
  Min,
} from 'class-validator';

export enum SortByEnum {
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
}

export enum OrderEnum {
  ASC = 'ASC',
  DESC = 'DESC',
}

type OrderType = 1 | -1;

export class BaseQueryDto {
  @IsInt()
  @Max(100)
  @Min(1)
  @Type(() => Number)
  limit: number = 10;

  @IsInt()
  @Min(0)
  @Type(() => Number)
  offset: number = 0;

  @IsEnum(SortByEnum)
  sortBy: SortByEnum = SortByEnum.CREATED_AT;

  @ApiProperty({ type: 'string', enum: OrderEnum, default: OrderEnum.DESC })
  @Transform(({ value }: { value: OrderEnum }) =>
    value === OrderEnum.ASC ? 1 : -1,
  )
  @IsNumber()
  order: OrderType;

  @ApiProperty({
    type: 'string',
    format: 'date',
    example: new Date().toISOString().split('T')[0] as unknown as Date,
  })
  @Transform(({ value }: { value?: unknown }) => {
    if (value && typeof value === 'string') {
      const dateFrom = new Date(value);
      dateFrom.setHours(0, 0, 0, 0);
      return dateFrom;
    }
    return undefined;
  })
  @IsDate()
  @IsOptional()
  dateFrom?: Date;

  @ApiProperty({
    type: 'string',
    format: 'date',
    example: new Date().toISOString().split('T')[0] as unknown as Date,
  })
  @Transform(({ value }: { value?: unknown }) => {
    if (value && typeof value === 'string') {
      const dateTo = new Date(value);
      dateTo.setHours(23, 59, 59, 999);
      return dateTo;
    }
    return undefined;
  })
  @IsDate()
  @IsOptional()
  dateTo?: Date;
}
