import { SmartContractNames } from '@arianee/common-types';

export const contractNameToArianeeApiContractName: Record<
  SmartContractNames,
  string
> = {
  ArianeeSmartAsset: 'smartAssetContract',
  ArianeeStore: 'storeContract',
  ArianeeIdentity: 'identityContract',
  ArianeeEvent: 'eventContract',
  ArianeeWhitelist: 'whitelistContract',
  Aria: 'ariaContract',
  ArianeeCreditHistory: 'creditHistoryContract',
  ArianeeMessage: 'messageContract',
  ArianeeUpdate: 'updateSmartAssetContract',
};
