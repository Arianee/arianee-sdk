import { Injectable } from '@angular/core';
import Creator from '@arianee/creator';
import Core from '@arianee/core';
import { BehaviorSubject } from 'rxjs';
import { defaultFetchLike } from '@arianee/utils';
import { ProtocolDetails, ProtocolDetailsV2 } from '@arianee/common-types';

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
      const mockProtocolDetails: ProtocolDetailsV2 = {
        protocolVersion: '2.0',
        chainId: 77,
        httpProvider: 'https://sokol.arianee.net',
        gasStation: 'https://gasstation.arianee.com/77',
        contractAdresses: {
          nft: '0xab459bf433187B78c66323Bf56e1E59bE1D405b6',
          ownershipRegistry: '0x40b6851Af149C70A7A5b7694dBD76f0A81a3F576',
          eventHub: '0xF45577b9B8a33EC58169c5c0f936F55e095Cf660',
          messageHub: '0x6271B6D8Dc92649e60b96806450D8C49802486Eb',
          rulesManager: '0xeF104AcFEaA0cff8eE9f9c5426bb4a2A818d26D4',
          creditManager: '0x6709a7e7FE038Dc32925Ba5A14704a7eD1e6bD2F',
        },
        nftInterfaces: {
          ERC721: true,
          SmartAsset: true,
          SmartAssetBurnable: true,
          SmartAssetRecoverable: true,
          SmartAssetSoulbound: false,
          SmartAssetUpdatable: true,
          SmartAssetURIStorage: true,
          SmartAssetURIStorageOverridable: false,
        },
      };

      // use our own resolver for v2-testnet as there is no built in resolver for v2 yet
      protocolDetailsResolver = async () => mockProtocolDetails;
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
