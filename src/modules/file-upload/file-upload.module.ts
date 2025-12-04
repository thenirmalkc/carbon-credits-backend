import { forwardRef, Module } from '@nestjs/common';
import { FileUploadController } from './file-upload.controller';
import { FileUploadService } from './file-upload.service';
import { S3Service } from './s3.service';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [AuthModule, forwardRef(() => UserModule)],
  controllers: [FileUploadController],
  providers: [FileUploadService, S3Service],
  exports: [FileUploadService],
})
export class FileUploadModule {}
