import { Body, Controller, Post } from '@nestjs/common';
import { WalletSerivce } from './wallet.service';
import { MintTokenDto } from './wallet.dto';

@Controller('wallets')
export class WalletController {
  constructor(private readonly walletService: WalletSerivce) {}

  @Post('mint-carbon-credits')
  mintCarbonCredits(@Body() body: MintTokenDto) {
    return this.walletService.mintCarbonCredits(body);
  }

  @Post('mint-usdt')
  mintUsdt(@Body() body: MintTokenDto) {
    return this.walletService.mintUsdt(body);
  }
}
