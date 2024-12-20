import { TransactionStrategy } from '../../creator';
import { CreateEventParameters, EventParametersBase } from '../../types';
import Utils from '../../utils/utils';

export const getCreateEventParams = async <
  Strategy extends TransactionStrategy
>(
  utils: Utils<Strategy>,
  params: EventParametersBase | CreateEventParameters
) => {
  const eventId = params.eventId ?? (await utils.getAvailableEventId());

  const uri = 'uri' in params && params.uri ? params.uri : '';

  return {
    ...params,
    uri,
    eventId,
  };
};
