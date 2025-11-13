import { Body, Controller, Post } from '@nestjs/common';
import { WalletSerivce } from './wallet.service';
import { MintTokenDto, SwapUsdtDto } from './wallet.dto';

@Controller('wallets')
export class WalletController {
  constructor(private readonly walletService: WalletSerivce) {}

  @Post('mint-carbon-credits')
  mintCarbonCredits(@Body() body: MintTokenDto) {
    return this.walletService.mintCarbonCredits(body);
  }

  @Post('swap-usdt')
  swapUsdt(@Body() body: SwapUsdtDto) {
    return this.walletService.swapUsdt(body);
  }
}
