import { ArianeeMessageI18N } from '@arianee/common-types';

export type CreateMessageParametersBase = {
  messageId?: number;
  smartAssetId: number;
};

export interface CreateAndStoreMessageParameters
  extends CreateMessageParametersBase {
  content: ArianeeMessageI18N;
}

export interface CreateMessageParameters extends CreateMessageParametersBase {
  uri: string;
}

export interface CreateMessageCommonParameters
  extends CreateMessageParametersBase {
  content: ArianeeMessageI18N;
}
