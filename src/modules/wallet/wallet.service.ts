import { Injectable } from '@nestjs/common';
import {
  Wallet,
  JsonRpcProvider,
  Contract,
  InterfaceAbi,
  Transaction,
} from 'ethers';
import { MintTokenDto } from './wallet.dto';
import erc20abi from './erc20abi.json';
import { HistoryService } from '../history/history.service';
import { HistoryActionEnum } from '../history/history.enum';
import { NetworkEnum } from '../../common/enum';

@Injectable()
export class WalletSerivce {
  private readonly sepoliaRpcUrl: string;
  private readonly provider: JsonRpcProvider;
  private readonly wallet: Wallet;
  private readonly carbonCreditContractAddress: string;
  private readonly usdtContractAddress: string;
  private readonly erc20abi = <InterfaceAbi>erc20abi;
  private readonly carbonCreditContract: Contract;
  private readonly usdtContract: Contract;

  constructor(private readonly historyService: HistoryService) {
    this.sepoliaRpcUrl = process.env.SEPOLIA_RPC_URL!;
    this.carbonCreditContractAddress =
      process.env.CARBON_CREDIT_CONTRACT_ADDRESS!;
    this.usdtContractAddress = process.env.USDT_CONTRACT_ADDRESS!;
    const pk = process.env.WALLET_PRIVATE_KEY;
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
    this.provider = new JsonRpcProvider(this.sepoliaRpcUrl);
    this.wallet = new Wallet(pk, this.provider);
    this.carbonCreditContract = new Contract(
      this.carbonCreditContractAddress,
      this.erc20abi,
      this.wallet,
    );
    this.usdtContract = new Contract(
      this.usdtContractAddress,
      this.erc20abi,
      this.wallet,
    );
  }

  async mintCarbonCredits(body: MintTokenDto) {
    const { toAddress, amount } = body;
    const tokenName = (await this.carbonCreditContract.name()) as string;
    const tokenSymbol = (await this.carbonCreditContract.symbol()) as string;
    const tokenDecimal = (await this.carbonCreditContract.decimals()) as bigint;
    const txn = (await this.carbonCreditContract.mint(
      toAddress,
      amount,
    )) as Transaction;
    await this.historyService.createHistory({
      network: NetworkEnum.SEPOLIA,
      userAddress: toAddress,
      action: HistoryActionEnum.MINT,
      txnHash: txn.hash!,
      tokenName,
      tokenSymbol,
      tokenDecimal: Number(tokenDecimal.toString()),
      amount,
    });
    return txn;
  }

  async mintUsdt(body: MintTokenDto) {
    const { toAddress, amount } = body;
    const tokenName = (await this.usdtContract.name()) as string;
    const tokenSymbol = (await this.usdtContract.symbol()) as string;
    const tokenDecimal = (await this.usdtContract.decimals()) as bigint;
    const txn = (await this.usdtContract.mint(
      toAddress,
      amount,
    )) as Transaction;
    await this.historyService.createHistory({
      network: NetworkEnum.SEPOLIA,
      userAddress: toAddress,
      action: HistoryActionEnum.MINT,
      txnHash: txn.hash!,
      tokenName,
      tokenSymbol,
      tokenDecimal: Number(tokenDecimal.toString()),
      amount,
    });
    return txn;
  }
}
