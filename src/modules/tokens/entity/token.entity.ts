import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { TokenStatusEnum } from '../tokens.enum';

export type TokenDocument = HydratedDocument<TokenEntity>;

@Schema({ timestamps: true, collection: 'tokens' })
export class TokenEntity {

  @Prop({ type: String, required: true })
  userId: string;

  @Prop({ type: [String], required: true })
  serialNumbers: string[];

  @Prop({ type: Number, required: true })
  count: number;

  @Prop({
    type: String,
    enum: TokenStatusEnum,
    default: TokenStatusEnum.PENDING,
  })
  status: TokenStatusEnum;

  @Prop({ type: String, default: '' })
  walletAddress: string;
}

export const TokenSchema = SchemaFactory.createForClass(TokenEntity);
