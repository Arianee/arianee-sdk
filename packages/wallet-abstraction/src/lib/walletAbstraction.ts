import {
  BrandIdentity,
  BrandIdentityWithOwned,
  DecentralizedMessage,
  Event,
  Protocol,
  SmartAsset,
} from '@arianee/common-types';

export interface WalletAbstraction {
  getSmartAsset(
    protocolName: Protocol['name'],
    smartAsset: {
      id: SmartAsset['certificateId'];
      passphrase?: string;
    },
    params?: {
      preferredLanguages?: string[];
      filterOutBridgedEvents?: boolean;
    }
  ): SmartAsset | Promise<SmartAsset>;

  getSmartAssetFromArianeeAccessToken(
    arianeeAccessToken: string,
    params?: {
      preferredLanguages?: string[];
    }
  ): SmartAsset | Promise<SmartAsset>;

  getSmartAssetEvents(
    protocolName: Protocol['name'],
    smartAsset: {
      id: SmartAsset['certificateId'];
      passphrase?: string;
    },
    params?: {
      preferredLanguages?: string[];
    }
  ): Event[] | Promise<Event[]>;

  getSmartAssetEventsFromArianeeAccessToken(
    arianeeAccessToken: string,
    params?: {
      preferredLanguages?: string[];
    }
  ): Event[] | Promise<Event[]>;

  getOwnedSmartAssets(params?: {
    onlyFromBrands?: string[];
    preferredLanguages?: string[];
    filterOutBridgedEvents?: boolean;
  }): SmartAsset[] | Promise<SmartAsset[]>;

  getReceivedMessages(params?: {
    preferredLanguages?: string[];
  }): DecentralizedMessage[] | Promise<DecentralizedMessage[]>;

  getMessage(
    id: DecentralizedMessage['id'],
    protocolName: Protocol['name'],
    params?: {
      preferredLanguages?: string[];
    }
  ): DecentralizedMessage | Promise<DecentralizedMessage>;

  getBrandIdentity(
    address: BrandIdentity['address'],
    params?: {
      preferredLanguages?: string[];
    }
  ): BrandIdentity | Promise<BrandIdentity>;

  getOwnedSmartAssetsBrandIdentities(params?: {
    preferredLanguages?: string[];
  }): BrandIdentityWithOwned[] | Promise<BrandIdentityWithOwned[]>;
}
