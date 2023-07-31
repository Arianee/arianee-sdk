import { SmartAsset } from '@arianee/common-types';

export type LinkObject = {
  smartAssetId: SmartAsset['certificateId'];
  deeplink?: string;
  passphrase?: string;
};
