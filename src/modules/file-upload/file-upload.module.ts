import { Module } from '@nestjs/common';
import { FileUploadController } from './file-upload.controller';
import { FileUploadService } from './file-upload.service';
import { S3Service } from './s3.service';

@Module({
  imports: [],
  controllers: [FileUploadController],
  providers: [FileUploadService, S3Service],
  exports: [FileUploadService],
})
export class FileUploadModule {}
