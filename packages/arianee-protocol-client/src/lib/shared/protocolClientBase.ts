import { GasStation, ProtocolDetails } from '@arianee/common-types';
import * as ethers6_permit721 from '@arianee/permit721-contracts';
import { PERMIT721_ADDRESS } from '@arianee/permit721-sdk';
import { Provider, Signer } from 'ethers';

export abstract class ProtocolClientBase<T extends ProtocolDetails> {
  public readonly permit721Contract: ethers6_permit721.Permit721;

  constructor(
    protected signer: Signer,
    private _protocolDetails: T,
    public readonly gasStation: GasStation | undefined
  ) {
    this.permit721Contract = ethers6_permit721.Permit721__factory.connect(
      PERMIT721_ADDRESS,
      this.signer
    );
  }

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
