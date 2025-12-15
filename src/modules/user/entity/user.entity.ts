import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { UserRoleEnum } from '../user.enum';
import {
  IsArray,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiHideProperty } from '@nestjs/swagger';
import bcrypt from 'bcrypt';
import { CommonBaseEntity } from '../../../common/entities/common-base.entity';

@Schema({ timestamps: true, collection: 'user' })
export class UserEntity extends CommonBaseEntity {
  @IsString()
  @Prop()
  firstName: string;

  @IsString()
  @Prop()
  lastName: string;

  @IsString()
  @Prop()
  fullName: string;

  @Transform(({ value }: { value: unknown }) => {
    if (typeof value === 'string') {
      return value.toLowerCase();
    }
  })
  @IsEmail()
  @Prop()
  email: string;

  @IsString()
  @Prop()
  password: string;

  @ApiHideProperty()
  @IsArray()
  @IsEnum(UserRoleEnum, { each: true })
  @Prop()
  userRoles: UserRoleEnum[];

  @IsString()
  @IsOptional()
  @Prop()
  image?: string;
}

export type UserDocument = HydratedDocument<UserEntity>;
export const UserSchema = SchemaFactory.createForClass(UserEntity);

UserSchema.index({ email: 1 }, { name: `user#email`, unique: true });

UserSchema.pre('save', async function () {
  // hashing password
  if (this.password) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  // setting fullname
  if (this.firstName && this.lastName) {
    this.fullName = this.firstName + ' ' + this.lastName;
  }
});

UserSchema.pre('updateOne', function () {
  // setting fullname
  const firstName = <string>this.get('firstName');
  const lastName = <string>this.get('lastName');
  if (firstName && lastName) {
    this.set('fullName', firstName + ' ' + lastName);
  }
});
