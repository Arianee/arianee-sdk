import {
  BrandIdentity,
  BrandIdentityWithOwned,
  ChainType,
} from '@arianee/common-types';
import { WalletAbstraction } from '@arianee/wallet-abstraction';

import { getPreferredLanguages, I18NStrategy } from '../../utils/i18n';
import EventManager from '../eventManager/eventManager';

export type IdentityInstance<T extends BrandIdentity | BrandIdentityWithOwned> =
  {
    data: T;
  };

export default class IdentityService<T extends ChainType> {
  public readonly updated: EventManager<T>['identityUpdated'];

  constructor(
    private walletAbstraction: WalletAbstraction,
    private eventManager: EventManager<T>,
    private i18nStrategy: I18NStrategy
  ) {
    this.updated = this.eventManager.identityUpdated;
  }

  /**
   * Returns an IdentityInstance for the identity whose address is issuer
   * @param issuer identity's issuer (address)
   * @param params additional parameters
   * @returns an identity instance
   */
  async get(
    issuer: string,
    params?: {
      i18nStrategy?: I18NStrategy;
    }
  ): Promise<IdentityInstance<BrandIdentity>> {
    const preferredLanguages = getPreferredLanguages(
      params?.i18nStrategy ?? this.i18nStrategy
    );

    const identity = await this.walletAbstraction.getBrandIdentity(issuer, {
      preferredLanguages,
    });

    return {
      data: identity,
    };
  }

  /**
   * @param params additional parameters
   * @returns all the identities of the smart assets owned by the user
   */
  async getOwnedSmartAssetsIdentities(params?: {
    i18nStrategy?: I18NStrategy;
  }): Promise<IdentityInstance<BrandIdentityWithOwned>[]> {
    const { i18nStrategy } = params ?? {};

    const preferredLanguages = getPreferredLanguages(
      i18nStrategy ?? this.i18nStrategy
    );

    const identities =
      await this.walletAbstraction.getOwnedSmartAssetsBrandIdentities({
        preferredLanguages,
      });

    const identitiesInstances = identities.map((identity) => ({
      data: identity,
    }));

    return identitiesInstances;
  }
}

export { IdentityService };
