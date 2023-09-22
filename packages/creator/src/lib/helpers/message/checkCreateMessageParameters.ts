import Creator, { TransactionStrategy } from '../../creator';
import { UnavailableMessageIdError } from '../../errors';
import {
  CreateMessageParameters,
  CreateMessageParametersBase,
} from '../../types';

export const checkCreateMessageParameters = async <
  Strategy extends TransactionStrategy
>(
  creator: Creator<Strategy>,
  params: CreateMessageParametersBase | CreateMessageParameters
) => {
  if (!params.smartAssetId) throw new Error('Smart asset id required');
  if (!params.messageId) throw new Error('Message id required');

  const messageIdAvailable = await creator.utils.isMessageIdAvailable(
    params.messageId
  );

  if (!messageIdAvailable)
    throw new UnavailableMessageIdError(
      'Message id already taken: ' + params.messageId
    );
};
