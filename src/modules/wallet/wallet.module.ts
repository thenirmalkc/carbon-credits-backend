import { Module } from '@nestjs/common';
import { WalletSerivce } from './wallet.service';
import { WalletController } from './wallet.controller';

@Module({
  controllers: [WalletController],
  providers: [WalletSerivce],
})
export class WalletModule {}
