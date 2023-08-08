import { Signer } from 'ethers';

import { ProtocolDetails } from './types';

export abstract class ProtocolClientBase {
  constructor(
    protected signer: Signer,
    public readonly protocolDetails: ProtocolDetails
  ) {}

  public async getNativeBalance(address: string) {
    if (!this.signer.provider)
      throw new Error(
        'The signer must have a provider to get the native balance'
      );

    return this.signer.provider.getBalance(address);
  }
}
