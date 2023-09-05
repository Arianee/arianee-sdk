import { UnavailableFeatureError } from '../../../errors';
import { ProtocolV2Feature } from '../../../shared/types';
import ProtocolClientV2 from '../../protocolClientV2';

/**
 * Checks that the passed feature is available on the protocol.
 * If the feature is not available, throws an UnavailableFeatureError.
 * @param feature the feature to check
 * @param protocolClientV2 the protocol client to check against
 */
export const requiresV2Feature = (
  feature: ProtocolV2Feature,
  protocolClientV2: ProtocolClientV2
): void => {
  if (!('collectionFeatures' in protocolClientV2.protocolDetails))
    throw new Error(
      'Malformed protocol details: collectionFeatures must be defined'
    );

  if (!protocolClientV2.protocolDetails.collectionFeatures[feature])
    throw new UnavailableFeatureError(
      `Feature "${feature}" is not available on this protocol`
    );
};
