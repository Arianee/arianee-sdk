import { ArianeeEventI18N } from '@arianee/common-types';

export type CreateEventParametersBase = {
  eventId?: number;
  smartAssetId: number;
};

export interface CreateAndStoreEventParameters
  extends CreateEventParametersBase {
  content: ArianeeEventI18N;
  useSmartAssetIssuerPrivacyGateway?: boolean;
}

export interface CreateEventParameters extends CreateEventParametersBase {
  uri: string;
}

export interface CreateEventCommonParameters extends CreateEventParametersBase {
  content: ArianeeEventI18N;
}
