import { Module, ValidationPipe } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CertificateModule } from './modules/certificate/certificate.module';
import { WalletModule } from './modules/wallet/wallet.module';
import { ConfigModule } from './config/config.module';
import { APP_PIPE } from '@nestjs/core';

@Module({
  imports: [ConfigModule, CertificateModule, WalletModule],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useFactory: () =>
        new ValidationPipe({ transform: true, whitelist: true }),
    },
  ],
})
export class AppModule {}
