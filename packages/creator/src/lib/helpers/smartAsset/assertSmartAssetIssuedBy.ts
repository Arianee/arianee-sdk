import { SmartAsset } from '@arianee/common-types';

import { TransactionStrategy } from '../../creator';
import { NotIssuerError } from '../../errors';
import Utils from '../../utils/utils';

export const assertSmartAssetIssuedBy = async <
  Strategy extends TransactionStrategy
>(
  {
    smartAssetId,
    expectedIssuer,
  }: {
    smartAssetId: SmartAsset['certificateId'];
    expectedIssuer: string;
  },
  utils: Utils<Strategy>
) => {
  const issuer = await utils.getSmartAssetIssuer(smartAssetId);

  if (issuer !== expectedIssuer)
    throw new NotIssuerError('You are not the issuer of this smart asset');
};
