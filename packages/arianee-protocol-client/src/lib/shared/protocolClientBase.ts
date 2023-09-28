import { Provider, Signer } from 'ethers';

import GasStation from '../utils/gasStation/gasStation';
import { ProtocolDetails } from '@arianee/common-types';

export abstract class ProtocolClientBase<T extends ProtocolDetails> {
  constructor(
    protected signer: Signer,
    private _protocolDetails: T,
    public readonly gasStation: GasStation
  ) {}

  public get protocolDetails(): T {
    return {
      ...this._protocolDetails,
    };
  }

  public async getNativeBalance(address: string) {
    return this.provider.getBalance(address);
  }

  public get provider(): Omit<Provider, 'destroy'> {
    if (!this.signer.provider)
      throw new Error('The signer must have a provider to get the provider');

    return this.signer.provider;
  }
}
