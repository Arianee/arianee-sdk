import {
  CreateMessageParameters,
  CreateMessageParametersBase,
} from '../../types';
import Utils from '../../utils/utils';

export const getCreateMessageParams = async (
  utils: Utils,
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
