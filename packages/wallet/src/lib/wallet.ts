import { ChainType } from '@arianee/common-types';
import { WalletAbstraction } from '@arianee/wallet-abstraction';
import Core from '@arianee/core';
import WalletApiClient from '@arianee/wallet-api-client';
import SmartAssetService from './services/smartAsset/smartAsset';
import MessageService from './services/message/message';
import IdentityService from './services/identity/identity';

export type WalletParams<T extends ChainType> = {
  chainType?: T;
  walletAbstraction?: WalletAbstraction;
  auth?: { core: Core } | { privateKey: string } | { mnemonic: string };
  i18nStrategy?: I18NStrategy;
  fetchLike?: typeof fetch;
};

export type I18NStrategy = 'raw' | { useLanguages: string[] };

class Wallet<T extends ChainType = 'testnet'> {
  private _chainType: T;
  private walletAbstraction: WalletAbstraction;
  private core: Core;
  private i18nStrategy: I18NStrategy;
  private fetchLike: typeof fetch;

  private _smartAsset: SmartAssetService<T>;
  private _identity: IdentityService<T>;
  private _message: MessageService<T>;

  constructor(params?: WalletParams<T>) {
    const { chainType, walletAbstraction, auth, i18nStrategy, fetchLike } =
      params ?? {};

    this._chainType = chainType ?? ('testnet' as T);
    this.core = this.getCoreFromAuth(auth);
    this.i18nStrategy = i18nStrategy ?? 'raw';

    if (typeof window === 'undefined') {
      this.fetchLike = fetchLike ?? require('node-fetch');
    } else {
      this.fetchLike = fetchLike ?? window.fetch;
    }

    this.walletAbstraction =
      walletAbstraction ??
      new WalletApiClient(this._chainType, this.core, {}, fetchLike);

    this._smartAsset = new SmartAssetService<T>();
    this._identity = new IdentityService<T>();
    this._message = new MessageService<T>();
  }

  private getCoreFromAuth(auth: WalletParams<T>['auth']) {
    if (!auth) {
      return Core.fromRandom();
    }

    if ('core' in auth) {
      return auth.core;
    } else if ('privateKey' in auth) {
      return Core.fromPrivateKey(auth.privateKey);
    } else if ('mnemonic' in auth) {
      return Core.fromMnemonic(auth.mnemonic);
    } else {
      throw new Error('Invalid auth provided');
    }
  }

  public get smartAsset() {
    return this._smartAsset;
  }

  public get identity() {
    return this._identity;
  }

  public get message() {
    return this._message;
  }

  public get chainType() {
    return this._chainType;
  }

  public getAddress() {
    return this.core.getAddress();
  }
}

export { Wallet };
export default Wallet;
