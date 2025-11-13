import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TokensController } from './tokens.controller';
import { TokensService } from './tokens.service';
import { TokenEntity, TokenSchema } from './entity/token.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TokenEntity.name, schema: TokenSchema },
    ]),
  ],
  controllers: [TokensController],
  providers: [TokensService],
  exports: [TokensService],
})
export class TokensModule {}

