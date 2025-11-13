import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { HistoryActionEnum, HistoryStatusEnum } from '../history.enum';
import { NetworkEnum } from '../../../common/enum';

export type HistoryDocument = HydratedDocument<HistoryEntity>;

@Schema({ timestamps: true, collection: 'history' })
export class HistoryEntity {
  @Prop({ type: String, enum: NetworkEnum, required: true })
  network: string;

  @Prop({ type: String, required: true })
  userAddress: string;

  @Prop({ type: String, enum: HistoryActionEnum, required: true })
  action: HistoryActionEnum;

  @Prop({ type: String, required: false })
  txnHash?: string;

  @Prop({ type: String, required: true })
  tokenName: string;

  @Prop({ type: String, required: true })
  tokenSymbol: string;

  @Prop({ type: Number, required: true })
  tokenDecimal: number;

  @Prop({ type: String, required: true })
  amount: string;

  @Prop({
    type: String,
    enum: HistoryStatusEnum,
    required: false,
    default: HistoryStatusEnum.PENDING,
  })
  status?: HistoryStatusEnum;
}

export const HistorySchema = SchemaFactory.createForClass(HistoryEntity);
