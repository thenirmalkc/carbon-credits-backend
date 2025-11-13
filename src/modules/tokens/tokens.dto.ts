import {
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  ValidateNested,
  IsNotEmpty,
} from 'class-validator';
import { BaseQueryDto } from '../../common/base-query.dto';
import { Transform, Type } from 'class-transformer';
import { TokenStatusEnum } from './tokens.enum';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTokenDto {
  @ApiProperty({ type: [String], description: 'Array of serial numbers' })
  @IsArray()
  @IsString({ each: true })
  serialNumbers: string[];

  @ApiProperty({
    enum: TokenStatusEnum,
    default: TokenStatusEnum.PENDING,
    required: false,
  })
  @IsEnum(TokenStatusEnum)
  @IsOptional()
  status?: TokenStatusEnum;

  @ApiProperty({ required: false, default: '' })
  @IsString()
  @IsOptional()
  walletAddress?: string;

  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  userId: string;
}

export class UpdateTokenDto {
  @ApiProperty({ type: [String], required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  serialNumbers?: string[];

  @ApiProperty({ enum: TokenStatusEnum, required: false })
  @IsEnum(TokenStatusEnum)
  @IsOptional()
  status?: TokenStatusEnum;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  walletAddress?: string;
}

export class GetTokensQueryDto extends BaseQueryDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  userId?: string;

  @ApiProperty({ enum: TokenStatusEnum, required: false })
  @IsEnum(TokenStatusEnum)
  @IsOptional()
  status?: TokenStatusEnum;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  walletAddress?: string;
}
