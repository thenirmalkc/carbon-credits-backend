import { IsEnum, IsOptional, IsString } from 'class-validator';
import { MimeTypeEnum } from '../../common/enum';

export class GetObjectDto {
  @IsString()
  filePath: string;
}

export class FileUploadQueryDto {
  @IsEnum(MimeTypeEnum)
  @IsOptional()
  mimeType?: MimeTypeEnum = MimeTypeEnum.WEBP;
}
