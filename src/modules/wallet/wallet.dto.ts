import Big from 'big.js';
import { Transform } from 'class-transformer';
import { IsString } from 'class-validator';
import { getAddress } from 'ethers';

export class MintTokenDto {
  @Transform(({ value }) => getAddress(<string>value))
  @IsString()
  toAddress: string;

  @Transform(({ value }) => new Big(<string>value).toFixed())
  @IsString()
  amount: string = '100';
}

export class SwapUsdtDto extends MintTokenDto {}

export class GetWalletBalancesQueryDto {
  @Transform(({ value }: { value: string }) => getAddress(value))
  @IsString()
  userAddress: string;
}
