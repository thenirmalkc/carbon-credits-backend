import { Module } from '@nestjs/common';
import { ConfigModule as EnvConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    EnvConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGODB_URL!, {
      dbName: 'eco_chain',
    }),
  ],
})
export class ConfigModule {}
