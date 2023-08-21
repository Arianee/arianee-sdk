import { ArianeeProductCertificateI18N } from '@arianee/common-types';

import { TokenAccess } from './tokenAccess';

export type CreateSmartAssetParametersBase = {
  smartAssetId?: number;
  tokenAccess?: TokenAccess;
  tokenRecoveryTimestamp?: number;
  sameRequestOwnershipPassphrase?: boolean;
};

export interface CreateAndStoreSmartAssetParameters
  extends CreateSmartAssetParametersBase {
  content: ArianeeProductCertificateI18N;
}

export interface CreateSmartAssetParameters
  extends CreateSmartAssetParametersBase {
  uri: string;
}

export interface CreateSmartAssetCommonParameters
  extends CreateSmartAssetParametersBase {
  content: ArianeeProductCertificateI18N;
}
