import { Module } from '@nestjs/common';
import { ConfigModule as EnvConfigModule } from '@nestjs/config';

@Module({ imports: [EnvConfigModule.forRoot()] })
export class ConfigModule {}
