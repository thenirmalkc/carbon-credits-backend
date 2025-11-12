import { Body, Controller, Post } from '@nestjs/common';
import { WalletSerivce } from './wallet.service';
import { MintTokenDto } from './wallet.dto';

@Controller('wallets')
export class WalletController {
  constructor(private readonly walletService: WalletSerivce) {}

  @Post('mint-token')
  mintToken(@Body() body: MintTokenDto) {
    return this.walletService.mintToken(body);
  }

  @Post('burn-token')
  burnToken(@Body() body: MintTokenDto) {
    return this.walletService.mintToken(body);
  }
}
