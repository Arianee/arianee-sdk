import { ArianeeProductCertificateI18N } from '@arianee/common-types';

export type CreateSmartAssetParametersBase = {
  smartAssetId?: number;
  tokenAccess?: { fromPassphrase: string } | { address: string };
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
