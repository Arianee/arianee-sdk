import { TransactionStrategy } from '../../creator';
import {
  CreateSmartAssetParameters,
  CreateSmartAssetParametersBase,
} from '../../types';
import Utils from '../../utils/utils';
import { getTokenAccessParams } from '../getTokenAccessParams/getTokenAccessParams';

export const getCreateSmartAssetParams = async <
  Strategy extends TransactionStrategy
>(
  utils: Utils<Strategy>,
  params: CreateSmartAssetParametersBase | CreateSmartAssetParameters
) => {
  const smartAssetId =
    params.smartAssetId ?? (await utils.getAvailableSmartAssetId());

  const tokenRecoveryTimestamp =
    params.tokenRecoveryTimestamp ??
    Math.ceil(
      new Date(new Date().getTime() + 60 * 60 * 24 * 365 * 5 * 1000).getTime() /
        1000
    );

  const initialKeyIsRequestKey = params.sameRequestOwnershipPassphrase ?? true;

  const { publicKey, passphrase } = getTokenAccessParams(params.tokenAccess);

  const uri = 'uri' in params && params.uri ? params.uri : '';

  return {
    smartAssetId,
    tokenRecoveryTimestamp,
    initialKeyIsRequestKey,
    publicKey,
    passphrase,
    uri,
  };
};
