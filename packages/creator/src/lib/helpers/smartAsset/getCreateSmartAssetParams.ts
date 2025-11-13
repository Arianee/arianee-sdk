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

  const defaultTokenRecoveryTimestamp = Math.ceil(
    new Date(999999999999999).getTime() / 1000
  );

  const tokenRecoveryTimestamp =
    params.tokenRecoveryTimestamp ?? defaultTokenRecoveryTimestamp;
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
