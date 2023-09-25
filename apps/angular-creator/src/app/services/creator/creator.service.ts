import { Injectable } from '@angular/core';
import Creator from '@arianee/creator';
import Core from '@arianee/core';
import { BehaviorSubject } from 'rxjs';
import { defaultFetchLike } from '@arianee/utils';
import { ProtocolDetails } from '@arianee/arianee-protocol-client';

@Injectable({
  providedIn: 'root',
})
export class CreatorService {
  private _creator: BehaviorSubject<Creator<'WAIT_TRANSACTION_RECEIPT'> | null> =
    new BehaviorSubject<Creator<'WAIT_TRANSACTION_RECEIPT'> | null>(null);

  public get connected() {
    return this._creator.getValue()?.connected || false;
  }

  public get creator() {
    return this._creator;
  }

  public async connect(
    auth: { privateKey: string } | { mnemonic: string },
    creatorAddress: string,
    slug: string
  ) {
    let core: Core;

    if ('privateKey' in auth) core = Core.fromPrivateKey(auth.privateKey);
    else if ('mnemonic' in auth) core = Core.fromMnemonic(auth.mnemonic);
    else throw new Error('auth should be privateKey or mnemonic');

    let protocolDetailsResolver: (() => Promise<ProtocolDetails>) | undefined =
      undefined;

    if (slug === 'v2-testnet-temp') {
      // use our own resolver for v2-testnet as there is no built in resolver for v2 yet
      protocolDetailsResolver = async () => ({
        httpProvider: 'https://sokol.arianee.net',
        gasStation: 'https://cert.arianee.net/gasStation/testnet.json',
        chainId: 77,
        contractAdresses: {
          nft: '0xf844b35F51a2df1Af7A7b86dA1C0CfAfa51A5BCA',
          ownership: '0xA5177B6F7c5F1a79E51e27423ddCE90c728B966c',
          rulesManager: '0x6C39Da7C40dB161b1aF17bE40389AF618fd6a8Cf',
          event: '0x0D70d06F3a56E9d662815410Fa4D05191471e763',
          message: '0x57792bDBbC3e74975E68931307db9E1d330c670c',
          credit: '0xef4C3E30114748732474Ca813A539dE9eFd3c694',
        },
        collectionFeatures: {
          burnable: true,
          recoverable: true,
          uriUpdatable: true,
          imprintUpdatable: true,
          transferable: true,
        },
        protocolVersion: '2',
      });
    }

    this._creator.next(
      new Creator({
        core,
        creatorAddress,
        transactionStrategy: 'WAIT_TRANSACTION_RECEIPT',
        fetchLike: (input, init) =>
          defaultFetchLike(input, {
            ...init,
            mode: 'cors',
          }),
        ...(protocolDetailsResolver ? { protocolDetailsResolver } : {}),
      })
    );

    await this._creator.getValue()?.connect(slug);
    return this.creator;
  }
}
