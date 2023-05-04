import {
  BrandIdentity,
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
    ...params: unknown[]
  ): SmartAsset | Promise<SmartAsset>;

  getSmartAssetEvents(
    protocolName: Protocol['name'],
    smartAsset: {
      id: SmartAsset['certificateId'];
      passphrase?: string;
    },
    ...params: unknown[]
  ): Event[] | Promise<Event[]>;

  getOwnedSmartAssets(
    ...params: unknown[]
  ): SmartAsset[] | Promise<SmartAsset[]>;

  getReceivedMessages(
    ...params: unknown[]
  ): DecentralizedMessage[] | Promise<DecentralizedMessage[]>;

  getBrandIdentity(
    address: BrandIdentity['address'],
    ...params: unknown[]
  ): BrandIdentity | Promise<BrandIdentity>;

  getOwnedSmartAssetsBrandIdentities(
    ...params: unknown[]
  ): BrandIdentity[] | Promise<BrandIdentity[]>;
}
