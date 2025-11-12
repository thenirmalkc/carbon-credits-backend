import { IsString } from 'class-validator';

export class MintTokenDto {
  @IsString()
  toAddress: string;

  @IsString()
  amount: string = '100';
}

export class BurnToken {
  @IsString()
  fromAddress: string;

  @IsString()
  amount: string = '100';
}
