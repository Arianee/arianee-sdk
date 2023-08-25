import Creator from '../../creator';
import { UnavailableEventIdError } from '../../errors';
import { CreateEventParameters, CreateEventParametersBase } from '../../types';

export const checkCreateEventParameters = async (
  creator: Creator,
  params: CreateEventParametersBase | CreateEventParameters
) => {
  if (!params.smartAssetId) throw new Error('Smart asset id required');
  if (!params.eventId) throw new Error('Event id required');

  const eventIdAvailable = await creator.utils.isEventIdAvailable(
    params.eventId
  );

  if (!eventIdAvailable)
    throw new UnavailableEventIdError(
      'Event id already taken: ' + params.eventId
    );
};
