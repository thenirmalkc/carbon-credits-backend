import { Injectable } from '@nestjs/common';
import { S3Service } from './s3.service';
import { FilePlusI } from '../../common/types';
import { generateFileName } from '../../common/helper';
import sharp from 'sharp';
import { ImageExtEnum } from './file-upload.enum';

@Injectable()
export class FileUploadService {
  constructor(private readonly s3Service: S3Service) {}

  async upload(file: FilePlusI) {
    await this.s3Service.upload(file.filename, file);
    return {
      filePath: file.filename,
      fileType: file.fileType,
      url: await this.s3Service.getObjectSignedUrl(file.filename),
    };
  }

  /* eslint-disable */
  async populateUrls(data: any, fields: string[], expiresIn?: number) {
    if (!data) {
      return;
    } else if (Array.isArray(data)) {
      for (const d of data) {
        await this.populateUrls(d, fields);
      }
    } else if (typeof data === 'object' && Object.keys(data).length) {
      for (const k in data) {
        const value = data[k];
        if (!value) continue;
        if (
          Array.isArray(value) ||
          (typeof value === 'object' && Object.keys(value).length)
        ) {
          await this.populateUrls(value, fields);
        } else {
          if (fields.includes(k)) {
            data[k + 'Url'] = await this.s3Service.getObjectSignedUrl(
              value,
              expiresIn,
            );
          }
        }
      }
    }
  }
  /* eslint-enable */

  getObjectSignedUrl(filePath: string) {
    return this.s3Service.getObjectSignedUrl(filePath);
  }

  async transformImage(value: FilePlusI, ext: string) {
    if (!value.mimetype.startsWith('image/')) return value;
    const output = sharp(value.buffer).rotate();
    if (ext === String(ImageExtEnum.WEBP)) {
      output.webp({ quality: 50 });
      value.mimetype = 'image/webp';
      value.ext = 'webp';
    } else if (ext === String(ImageExtEnum.PNG)) {
      output.png({ quality: 50 });
      value.mimetype = 'image/png';
      value.ext = 'png';
    } else if (
      [ImageExtEnum.JPEG, ImageExtEnum.JPG].map((x) => String(x)).includes(ext)
    ) {
      output.jpeg({ quality: 50 });
      value.mimetype = 'image/jpeg';
      value.ext = 'jpg';
    } else {
      return value;
    }
    value.buffer = await output.toBuffer();
    value.size = value.buffer.length;
    value.filename = `${generateFileName()}.${value.ext}`;
    return value;
  }
}
