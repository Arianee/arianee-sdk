import { PermitTransferFrom } from '@arianee/permit721-sdk';
import { ArianeeAccessTokenPayload } from './ArianeeAccessTokenPayload';

export interface SmartAssetSharingTokenPayload
  extends ArianeeAccessTokenPayload {
  permit?: PermitTransferFrom;
  permitSig?: string;
}
