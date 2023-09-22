import { TransactionStrategy } from '../../creator';
import { UnavailableSmartAssetIdError } from '../../errors';
import { CreateSmartAssetParametersBase } from '../../types';
import Utils from '../../utils/utils';

export const checkCreateSmartAssetParameters = async <
  Strategy extends TransactionStrategy
>(
  utils: Utils<Strategy>,
  params: CreateSmartAssetParametersBase
) => {
  if (!params.smartAssetId) throw new Error('Smart asset id required');

  const canCreate = await utils.canCreateSmartAsset(params.smartAssetId);
  if (!canCreate) {
    throw new UnavailableSmartAssetIdError(
      `You cannot create a smart asset with id ${params.smartAssetId}`
    );
  }
};
