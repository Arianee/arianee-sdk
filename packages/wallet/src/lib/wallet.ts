import { ChainType } from '@arianee/common-types';
import { WalletAbstraction } from '@arianee/wallet-abstraction';
import Core from '@arianee/core';
import WalletApiClient from '@arianee/wallet-api-client';
import SmartAssetService from './services/smartAsset/smartAsset';
import MessageService from './services/message/message';
import IdentityService from './services/identity/identity';
import { I18NStrategy } from './utils/i18n';
import EventManager, {
  EventManagerParams,
} from './services/eventManager/eventManager';
import {
  ArianeeAccessToken,
  PayloadOverride,
} from '@arianee/arianee-access-token';
import { WalletRewards } from './utils/walletReward/walletReward';
import ArianeeProtocolClient from '@arianee/arianee-protocol-client';
import { defaultFetchLike } from '@arianee/utils';
import { MemoryStorage } from '@arianee/utils';

export type WalletParams<T extends ChainType> = {
  chainType?: T;
  walletAbstraction?: WalletAbstraction;
  auth?: { core: Core } | { privateKey: string } | { mnemonic: string };
  i18nStrategy?: I18NStrategy;
  fetchLike?: typeof fetch;
  eventManagerParams?: EventManagerParams;
  arianeeAccessToken?: ArianeeAccessToken;
  arianeeAccessTokenPrefix?: string;
  walletRewards?: WalletRewards;
  storage?: Storage;
};

export default class Wallet<T extends ChainType = 'testnet'> {
  private _chainType: T;
  private walletAbstraction: WalletAbstraction;
  private core: Core;
  private i18nStrategy: I18NStrategy;
  private fetchLike: typeof fetch;
  private eventManager: EventManager<T>;
  private arianeeAccessToken: ArianeeAccessToken;
  private arianeeAccessTokenPrefix?: string;
  private walletRewards: WalletRewards;
  private storage: Storage;

  private _smartAsset: SmartAssetService<T>;
  private _identity: IdentityService<T>;
  private _message: MessageService<T>;

  constructor(params?: WalletParams<T>) {
    const {
      chainType,
      walletAbstraction,
      auth,
      i18nStrategy,
      fetchLike,
      eventManagerParams,
      arianeeAccessToken,
      arianeeAccessTokenPrefix,
      walletRewards,
      storage,
    } = params ?? {};

    this._chainType = chainType ?? ('testnet' as T);
    this.core = this.getCoreFromAuth(auth);
    this.i18nStrategy = i18nStrategy ?? 'raw';
    this.arianeeAccessTokenPrefix = arianeeAccessTokenPrefix;

    this.fetchLike = fetchLike ?? defaultFetchLike;

    this.storage = storage ?? new MemoryStorage();

    this.arianeeAccessToken =
      arianeeAccessToken ??
      new ArianeeAccessToken(this.core, { storage: this.storage });

    this.walletAbstraction =
      walletAbstraction ??
      new WalletApiClient(
        this._chainType,
        this.core,
        {
          arianeeAccessToken: this.arianeeAccessToken,
          arianeeAccessTokenPrefix: this.arianeeAccessTokenPrefix,
        },
        this.fetchLike
      );

    this.walletRewards = walletRewards ?? {
      poa: '0x39da7e30d2D5F2168AE3B8599066ab122680e1ef',
      sokol: '0xC7f2c65E88c98df41f9992a14546Ed2770e5Ac6b',
      polygon: '0x1C47291C40B86802fd42d59B186dE6C978dF8937',
    };

    this.eventManager = new EventManager(
      this._chainType,
      this.walletAbstraction,
      this.getAddress(),
      this.fetchLike,
      eventManagerParams
    );

    const arianeeProtocolClient = new ArianeeProtocolClient(this.core, {
      fetchLike: this.fetchLike,
    });

    this._smartAsset = new SmartAssetService({
      walletAbstraction: this.walletAbstraction,
      eventManager: this.eventManager,
      i18nStrategy: this.i18nStrategy,
      arianeeAccessToken: this.arianeeAccessToken,
      walletRewards: this.walletRewards,
      arianeeProtocolClient,
      core: this.core,
    });

    this._identity = new IdentityService<T>(
      this.walletAbstraction,
      this.eventManager,
      this.i18nStrategy
    );

    this._message = new MessageService<T>({
      walletAbstraction: this.walletAbstraction,
      eventManager: this.eventManager,
      i18nStrategy: this.i18nStrategy,
      walletRewards: this.walletRewards,
      arianeeProtocolClient,
    });
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

  /**
   * Use this to force trigger an authentication signature if
   * you use a wallet provider such as Metamask or WalletConnect
   * @param sessionDuration duration of the session in seconds
   */
  public async authenticate(sessionDuration?: number): Promise<void> {
    const payloadOverride: PayloadOverride = {};
    if (sessionDuration) {
      payloadOverride.exp = Date.now() + sessionDuration * 1000;
    }
    await this.arianeeAccessToken.getValidWalletAccessToken(payloadOverride, {
      prefix: this.arianeeAccessTokenPrefix,
    });
  }
}

export { Wallet };
