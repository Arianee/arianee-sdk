import { ArianeeEventI18N } from '@arianee/common-types';
import { EventParametersBase } from './eventParametersBase';

export interface CreateAndStoreEventParameters extends EventParametersBase {
  content: ArianeeEventI18N;
  useSmartAssetIssuerPrivacyGateway?: boolean;
}

export interface CreateEventParameters extends EventParametersBase {
  uri: string;
}

export interface CreateEventCommonParameters extends EventParametersBase {
  content: ArianeeEventI18N;
}
