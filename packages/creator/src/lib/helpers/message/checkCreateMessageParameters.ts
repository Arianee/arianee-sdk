import Creator from '../../creator';
import { NotOwnerError, UnavailableMessageIdError } from '../../errors';
import {
  CreateMessageParameters,
  CreateMessageParametersBase,
} from '../../types';

export const checkCreateMessageParameters = async (
  creator: Creator,
  params: CreateMessageParametersBase | CreateMessageParameters
) => {
  if (!params.smartAssetId) throw new Error('Smart asset id required');
  if (!params.messageId) throw new Error('Message id required');

  const smartAssetOwner = await creator.utils.getSmartAssetOwner(
    params.smartAssetId.toString()
  );

  if (smartAssetOwner !== creator.core.getAddress())
    throw new NotOwnerError(
      'You are not the owner of this smart asset: ' + params.smartAssetId
    );

  const messageIdAvailable = await creator.utils.isMessageIdAvailable(
    params.messageId
  );

  if (!messageIdAvailable)
    throw new UnavailableMessageIdError(
      'Message id already taken: ' + params.messageId
    );
};
