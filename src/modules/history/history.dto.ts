import { IsString } from 'class-validator';
import { BaseQueryDto } from '../../common/base-query.dto';
import { Transform } from 'class-transformer';
import { getAddress } from 'ethers';

export class GetHistoryQueryDto extends BaseQueryDto {
  @Transform(({ value }) => getAddress(<string>value))
  @IsString()
  userAddress: string;
}
