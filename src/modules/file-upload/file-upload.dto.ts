import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ImageExtEnum } from './file-upload.enum';

export class FileUploadQuery {
  @IsEnum(ImageExtEnum)
  @IsOptional()
  imageExt?: ImageExtEnum;
}

export class GetObjectIn {
  @IsString()
  filePath: string;
}
