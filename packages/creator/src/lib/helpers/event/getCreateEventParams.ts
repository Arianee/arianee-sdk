import { CreateEventParameters, CreateEventParametersBase } from '../../types';
import Utils from '../../utils/utils';

export const getCreateEventParams = async (
  utils: Utils,
  params: CreateEventParametersBase | CreateEventParameters
) => {
  const eventId = params.eventId ?? (await utils.getAvailableEventId());

  const uri = 'uri' in params && params.uri ? params.uri : '';

  return {
    ...params,
    uri,
    eventId,
  };
};
