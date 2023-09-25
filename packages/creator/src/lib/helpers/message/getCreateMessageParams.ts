import { TransactionStrategy } from '../../creator';
import {
  CreateMessageParameters,
  CreateMessageParametersBase,
} from '../../types';
import Utils from '../../utils/utils';

export const getCreateMessageParams = async <
  Strategy extends TransactionStrategy
>(
  utils: Utils<Strategy>,
  params: CreateMessageParametersBase | CreateMessageParameters
) => {
  const messageId = params.messageId ?? (await utils.getAvailableMessageId());

  const uri = 'uri' in params && params.uri ? params.uri : '';

  return {
    ...params,
    uri,
    messageId,
  };
};
