import { Module, ValidationPipe } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CertificateModule } from './modules/certificate/certificate.module';
import { WalletModule } from './modules/wallet/wallet.module';
import { ConfigModule } from './config/config.module';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';
import { AllExceptionFilter } from './common/all-exception.filter';
import { HistoryModule } from './modules/history/history.module';

@Module({
  imports: [ConfigModule, CertificateModule, WalletModule, HistoryModule],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useFactory: () =>
        new ValidationPipe({ transform: true, whitelist: true }),
    },
    { provide: APP_FILTER, useClass: AllExceptionFilter },
  ],
})
export class AppModule {}
