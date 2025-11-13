import { Injectable } from '@nestjs/common';
import {
  Wallet,
  JsonRpcProvider,
  Contract,
  InterfaceAbi,
  Transaction,
  getAddress,
} from 'ethers';
import { MintTokenDto, SwapUsdtDto } from './wallet.dto';
import erc20Abi from './erc20Abi.json';
import { HistoryService } from '../history/history.service';
import { HistoryActionEnum } from '../history/history.enum';
import { NetworkEnum } from '../../common/enum';
import balanceCheckerAbi from './balanceCheckerAbi.json';
import { TokenInfoI } from './wallet.types';
import Big from 'big.js';

@Injectable()
export class WalletSerivce {
  private readonly sepoliaRpcUrl: string;
  private readonly provider: JsonRpcProvider;
  private readonly wallet: Wallet;
  private readonly carbonCreditContractAddress: string;
  private readonly usdtContractAddress: string;
  private readonly erc20Abi = <InterfaceAbi>erc20Abi;
  private readonly carbonCreditContract: Contract;
  private readonly usdtContract: Contract;
  private readonly balanceCheckerContractAddress: string;
  private readonly balanceCheckerAbi = <InterfaceAbi>balanceCheckerAbi;
  private readonly balanceCheckerContract: Contract;

  constructor(private readonly historyService: HistoryService) {
    this.sepoliaRpcUrl = process.env.SEPOLIA_RPC_URL!;
    this.carbonCreditContractAddress =
      process.env.CARBON_CREDIT_CONTRACT_ADDRESS!;
    this.usdtContractAddress = process.env.USDT_CONTRACT_ADDRESS!;
    const pk = process.env.WALLET_PRIVATE_KEY;
    this.balanceCheckerContractAddress =
      process.env.BALANCE_CHECKER_CONTRACT_ADDRESS!;
    if (!this.sepoliaRpcUrl) {
      throw new Error('Sepolia rpc url is required');
    }
    if (!this.carbonCreditContractAddress) {
      throw new Error('Carbon credit contract address is required');
    }
    if (!this.usdtContractAddress) {
      throw new Error('Usdt contract address is required');
    }
    if (!pk) {
      throw new Error('Wallet private key is required');
    }
    if (!this.balanceCheckerContractAddress) {
      throw new Error('Balance checker contract address is required');
    }
    this.provider = new JsonRpcProvider(this.sepoliaRpcUrl);
    this.wallet = new Wallet(pk, this.provider);
    this.carbonCreditContract = new Contract(
      this.carbonCreditContractAddress,
      this.erc20Abi,
      this.wallet,
    );
    this.usdtContract = new Contract(
      this.usdtContractAddress,
      this.erc20Abi,
      this.wallet,
    );
    this.balanceCheckerContract = new Contract(
      this.balanceCheckerContractAddress,
      this.balanceCheckerAbi,
      this.provider,
    );
  }

  async getWalletBalances(userAddress: string) {
    const balances = (await this.balanceCheckerContract.getTokensInfo(
      [this.usdtContractAddress, this.carbonCreditContractAddress],
      userAddress,
    )) as (string | bigint)[][];
    const formattedBalances = balances.map((x) => {
      const decimals = parseInt((x[3] as bigint).toString());
      const balance = new Big((x[4] as bigint).toString())
        .div(new Big(10).pow(decimals))
        .toFixed();
      return <TokenInfoI>{
        contractAddress: getAddress(x[0] as string),
        name: x[1] as string,
        symbol: x[2] as string,
        decimals,
        balance,
      };
    });
    return formattedBalances;
  }

  async mintCarbonCredits(body: MintTokenDto) {
    const { toAddress, amount } = body;
    const txn = (await this.carbonCreditContract.mint(
      toAddress,
      amount,
    )) as Transaction;
    await this.historyService.createHistory({
      network: NetworkEnum.SEPOLIA,
      userAddress: toAddress,
      action: HistoryActionEnum.MINT,
      txnHash: txn.hash!,
      tokenName: 'Carbon credit',
      tokenSymbol: 'tCC',
      tokenDecimal: 18,
      amount,
    });
    return txn;
  }

  async swapUsdt(body: SwapUsdtDto) {
    const { toAddress, amount } = body;
    const txn = (await this.usdtContract.mint(
      toAddress,
      amount,
    )) as Transaction;
    await this.historyService.createHistory({
      network: NetworkEnum.SEPOLIA,
      userAddress: toAddress,
      action: HistoryActionEnum.SWAP,
      txnHash: txn.hash!,
      tokenName: 'tUSDt',
      tokenSymbol: 'tUSDt',
      tokenDecimal: 18,
      amount,
    });
    return txn;
  }
}
