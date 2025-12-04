import { Express } from 'express';

import { FileTypeEnum } from './enum';

export interface FilePlusI extends Express.Multer.File {
  fileType: FileTypeEnum;
  ext: string;
}
