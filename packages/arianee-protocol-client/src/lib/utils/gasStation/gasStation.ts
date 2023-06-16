import { ethers } from 'ethers';

type GasPrices = {
  safeLow: number;
  standard: number;
  fast: number;
  fastest: number;
};

export default class GasStation {
  constructor(private url: string, private fetchLike: typeof fetch) {}

  public async getGasPrice(): Promise<bigint> {
    const res = await this.fetchLike(this.url);
    const { standard } = (await res.json()) as GasPrices;

    return ethers.parseUnits(standard.toString(), 'gwei');
  }
}
