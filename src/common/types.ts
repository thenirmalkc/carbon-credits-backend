import { Express } from 'express';
import { UserRoleEnum } from '../modules/user/user.enum';
import { FileTypeEnum } from '../modules/file-upload/file-upload.enum';
import { Types } from 'mongoose';

export interface UserI {
  _id: Types.ObjectId;
  id: string;
  email: string;
  userRoles: UserRoleEnum[];
}

export interface FilePlusI extends Express.Multer.File {
  fileType: FileTypeEnum;
  ext: string;
}
