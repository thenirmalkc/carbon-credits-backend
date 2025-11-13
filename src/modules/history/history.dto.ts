import { IsEnum, IsIn, IsOptional, IsString } from 'class-validator';
import { BaseQueryDto } from '../../common/base-query.dto';
import { Transform } from 'class-transformer';
import { getAddress } from 'ethers';
import { HistoryActionEnum, HistoryStatusEnum } from './history.enum';

export class GetHistoryQueryDto extends BaseQueryDto {
  @Transform(({ value }) => getAddress(<string>value))
  @IsString()
  @IsOptional()
  userAddress?: string;

  @IsEnum(HistoryActionEnum)
  @IsOptional()
  action?: HistoryActionEnum;

  @IsEnum(HistoryStatusEnum)
  @IsOptional()
  status?: HistoryStatusEnum;
}

export class UpdateHistoryStatusDto {
  @IsIn([HistoryStatusEnum.APPROVED, HistoryStatusEnum.REJECTED])
  status: HistoryStatusEnum;
}
