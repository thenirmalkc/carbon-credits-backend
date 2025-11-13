export interface TokenInfoI {
  contractAddress: string;
  name: string;
  symbol: string;
  decimals: number;
  balance: bigint | string;
}
