import { Injectable, PipeTransform } from '@nestjs/common';
import sharp from 'sharp';
import { FilePlusI } from '../../common/types';

@Injectable()
export class ImageCompressionPipe implements PipeTransform {
  async transform(value: FilePlusI) {
    if (!value.mimetype.startsWith('image/')) return value;
    value.buffer = await sharp(value.buffer)
      .rotate()
      .webp({ quality: 50 })
      .toBuffer();
    value.mimetype = 'image/webp';
    value.ext = 'webp';
    value.size = value.buffer.length;
    return value;
  }
}
