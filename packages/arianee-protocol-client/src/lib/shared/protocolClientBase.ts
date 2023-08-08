import { Provider, Signer } from 'ethers';

import { ProtocolDetails } from './types';

export abstract class ProtocolClientBase {
  constructor(
    protected signer: Signer,
    public readonly protocolDetails: ProtocolDetails
  ) {}

  public async getNativeBalance(address: string) {
    return this.provider.getBalance(address);
  }

  public get provider(): Omit<Provider, 'destroy'> {
    if (!this.signer.provider)
      throw new Error('The signer must have a provider to get the provider');

    return this.signer.provider;
  }
}
