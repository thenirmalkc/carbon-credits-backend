import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsEnum, IsInt, IsNumber, Max, Min } from 'class-validator';

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
}
