import { SmartAsset } from '@arianee/common-types';

import { NotIssuerError } from '../../errors';
import Utils from '../../utils/utils';

export const assertSmartAssetIssuedBy = async (
  {
    smartAssetId,
    expectedIssuer,
  }: {
    smartAssetId: SmartAsset['certificateId'];
    expectedIssuer: string;
  },
  utils: Utils
) => {
  const issuer = await utils.getSmartAssetIssuer(smartAssetId);

  if (issuer !== expectedIssuer)
    throw new NotIssuerError('You are not the issuer of this smart asset');
};
