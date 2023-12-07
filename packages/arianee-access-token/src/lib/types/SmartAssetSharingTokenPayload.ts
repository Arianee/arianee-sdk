import { PermitTransferFrom } from '@arianee/permit721-sdk';

import { ArianeeAccessTokenPayload } from './arianeeAccessTokenPayload';

export interface SmartAssetSharingTokenPayload
  extends ArianeeAccessTokenPayload {
  permit?: PermitTransferFrom;
  permitSig?: string;
}
