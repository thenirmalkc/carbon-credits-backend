import { Module } from '@nestjs/common';
import { WalletSerivce } from './wallet.service';
import { WalletController } from './wallet.controller';
import { HistoryModule } from '../history/history.module';

@Module({
  imports: [HistoryModule],
  controllers: [WalletController],
  providers: [WalletSerivce],
})
export class WalletModule {}
