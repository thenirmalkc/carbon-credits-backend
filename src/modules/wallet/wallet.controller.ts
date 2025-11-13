import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { WalletSerivce } from './wallet.service';
import {
  BurnCarbonCreditsDto,
  GetWalletBalancesQueryDto,
  MintTokenDto,
  SwapCarbonCreditsDto,
  SwapUsdtDto,
} from './wallet.dto';

@Controller('wallets')
export class WalletController {
  constructor(private readonly walletService: WalletSerivce) {}

  @Get('balances')
  getWalletBalances(@Query() filter: GetWalletBalancesQueryDto) {
    return this.walletService.getWalletBalances(filter.userAddress);
  }

  @Post('mint-carbon-credits')
  mintCarbonCredits(@Body() body: MintTokenDto) {
    return this.walletService.mintCarbonCredits(body);
  }

  @Post('mint-usdt')
  mintUsdt(@Body() body: MintTokenDto) {
    return this.walletService.mintUsdt(body);
  }

  @Post('swap-carbon-credits')
  swapCarbonCredits(@Body() body: SwapCarbonCreditsDto) {
    return this.walletService.swapCarbonCredits(body);
  }

  @Post('swap-usdt')
  swapUsdt(@Body() body: SwapUsdtDto) {
    return this.walletService.swapUsdt(body);
  }

  @Post('burn-carbon-credits')
  burnCarbonCredit(@Body() body: BurnCarbonCreditsDto) {
    return this.walletService.burnCarbonCredits(body);
  }
}
