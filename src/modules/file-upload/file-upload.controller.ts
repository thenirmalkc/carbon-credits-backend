import {
  Body,
  Controller,
  HttpException,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FileUploadService } from './file-upload.service';
import * as multer from 'multer';
import { FilePlusI } from '../../common/types';
import { S3Service } from './s3.service';
import { FileUploadQuery, GetObjectIn } from './file-upload.dto';
import { generateFileName } from '../../common/helper';
import { FileTypeEnum } from './file-upload.enum';

@ApiTags('File upload')
@Controller('file-upload')
export class FileUploadController {
  constructor(
    private readonly fileUploadService: FileUploadService,
    private readonly s3Service: S3Service,
  ) {}

  @ApiOperation({ summary: 'File Upload' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
      required: ['file'],
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: multer.memoryStorage(),
      limits: { fileSize: 1024 * 1024 * 10 }, // in mb (value must be integer)
      fileFilter(req, file: FilePlusI, callback) {
        // add file type
        if (file.mimetype.startsWith('image')) {
          file.fileType = FileTypeEnum.IMAGE;
        } else if (file.mimetype === 'application/pdf') {
          file.fileType = FileTypeEnum.PDF;
        } else if (file.mimetype === 'text/csv') {
          file.fileType = FileTypeEnum.CSV;
        } else if (
          file.mimetype ===
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        ) {
          file.fileType = FileTypeEnum.CSV;
        } else {
          return callback(null, false);
        }

        // add ext
        const splittedFileName = file.originalname.split('.');
        file.ext = splittedFileName[splittedFileName.length - 1];

        // add filename
        file.filename = generateFileName(40) + '.' + file.ext;

        callback(null, true);
      },
    }),
  )
  @Post()
  async uploadFile(
    @UploadedFile()
    file: FilePlusI,
    @Query() filter: FileUploadQuery,
  ) {
    if (!file) {
      throw new HttpException(
        'File type not allowed. Allowed file types are [image, pdf, csv, xlsx] only',
        400,
      );
    }
    await this.fileUploadService.transformImage(
      file,
      String(filter.imageExt) || file.ext,
    );
    return this.fileUploadService.upload(file);
  }

  @ApiOperation({ summary: 'get signed url to get object' })
  @Post('get-object')
  async getObject(@Body() body: GetObjectIn) {
    return {
      url: await this.s3Service.getObjectSignedUrl(body.filePath, 900),
    };
  }
}
