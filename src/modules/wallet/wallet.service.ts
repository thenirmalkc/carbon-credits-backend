import { Injectable } from '@nestjs/common';
import {
  Wallet,
  JsonRpcProvider,
  Contract,
  InterfaceAbi,
  parseUnits,
  Transaction,
} from 'ethers';
import { BurnToken, MintTokenDto } from './wallet.dto';
import erc20abi from './erc20abi.json';

@Injectable()
export class WalletSerivce {
  private readonly sepoliaRpcUrl: string;
  private readonly provider: JsonRpcProvider;
  private readonly wallet: Wallet;
  private readonly carbonCreditContractAddress: string;
  private readonly erc20abi = <InterfaceAbi>erc20abi;

  constructor() {
    this.sepoliaRpcUrl = process.env.SEPOLIA_RPC_URL!;
    const pk = process.env.WALLET_PRIVATE_KEY;
    this.carbonCreditContractAddress =
      process.env.CARBON_CREDIT_SMART_CONTRACT!;
    if (!this.sepoliaRpcUrl) {
      throw new Error('Sepolia rpc url is required');
    }
    if (!pk) {
      throw new Error('Wallet private key is required');
    }
    if (!this.carbonCreditContractAddress) {
      throw new Error('Carbon credit contract address is required');
    }
    this.provider = new JsonRpcProvider(this.sepoliaRpcUrl);
    this.wallet = new Wallet(pk, this.provider);
  }

  async mintToken(body: MintTokenDto) {
    const { toAddress, amount } = body;
    const contract = new Contract(
      this.carbonCreditContractAddress,
      this.erc20abi,
      this.wallet,
    );
    const decimals = (await contract.decimals()) as number;
    const value = parseUnits(amount, decimals);
    const txn = (await contract.mint(toAddress, value)) as Transaction;
    return txn;
  }

  async burnToken(body: BurnToken) {
    const { fromAddress, amount } = body;
    const contract = new Contract(
      this.carbonCreditContractAddress,
      this.erc20abi,
      this.wallet,
    );
    const decimals = (await contract.decimals()) as number;
    const value = parseUnits(amount, decimals);
    const txn = (await contract.burn(fromAddress, value)) as Transaction;
    return txn;
  }
}
