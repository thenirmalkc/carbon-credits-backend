import {
  Body,
  Controller,
  HttpException,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { FileUploadService } from './file-upload.service';
import * as multer from 'multer';
import { FilePlusI } from '../../common/types';
import { FileTypeEnum } from '../../common/enum';
import { S3Service } from './s3.service';
import { FileUploadQueryDto, GetObjectDto } from './file-upload.dto';
import { FilteredQuery } from '../../common/decorators/filtered-query.decorator';

@Controller('file-upload')
export class FileUploadController {
  constructor(
    private readonly fileUploadService: FileUploadService,
    private readonly s3Service: S3Service,
  ) {}

  @ApiQuery({ type: FileUploadQueryDto })
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
        } else {
          return callback(null, false);
        }
        callback(null, true);
      },
    }),
  )
  @Post()
  async uploadFile(
    @UploadedFile()
    file: FilePlusI,
    @FilteredQuery() filter: FileUploadQueryDto,
  ) {
    if (!file) {
      throw new HttpException('Only image and pdf files are allowed', 400);
    }
    await this.fileUploadService.transformImage(file, filter.mimeType);
    return this.fileUploadService.upload(file);
  }

  @ApiOperation({ summary: 'get signed url to get object' })
  @Post('get-object')
  async getObject(@Body() body: GetObjectDto) {
    return {
      url: await this.s3Service.getObjectSignedUrl(body.filePath, 900),
    };
  }
}
