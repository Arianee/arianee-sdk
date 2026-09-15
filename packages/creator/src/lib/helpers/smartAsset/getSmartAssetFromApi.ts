/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  ArianeeApiClient,
  ArianeeApiError,
  smartAssetInfo,
} from '@arianee/arianee-api-client';
import { defaultFetchLike, retryFetchLike } from '@arianee/utils';

import Creator, { TransactionStrategy } from '../../creator';

/**
 * Deliberately NOT the default client of `ArianeeApiClient`, which wraps its
 * fetch in `cachedFetchLike(..., { timeToLive: 5 min })`. `owner` moves on every
 * transfer and `imprint` on every update, so a five minute old answer would be
 * wrong in exactly the flows that read them. The HTTP retries are kept: they
 * cost nothing on a healthy call and cover a blip on the API itself.
 */
const arianeeApiClient = new ArianeeApiClient(
  undefined,
  retryFetchLike(defaultFetchLike, 3)
);

/**
 * Reads a smart asset from the Arianee API. This is the only source consulted:
 * `owner`, `issuer` and `imprint` are all indexed there, and the protocol RPC is
 * no longer on the path. That gateway is the weak link, a Cloudflare 1101 on the
 * POA worker was enough to fail a pairing.
 *
 * Returns `null` when, and only when, the API answers 404. A 404 is a statement
 * ("no such token"); a timeout or a 5xx is not, so those are rethrown. Treating
 * an unreachable API as "this token is free" would hand out ids over an entire
 * outage, which is a far worse failure than the one being fixed.
 */
export const getSmartAssetFromApi = async <
  Strategy extends TransactionStrategy
>(
  creator: Creator<Strategy>,
  smartAssetId: string | number
): Promise<smartAssetInfo | null> => {
  try {
    return await arianeeApiClient.network.getNft(
      creator.slug!,
      smartAssetId.toString()
    );
  } catch (e) {
    if ((e as ArianeeApiError).status === 404) return null;
    throw e;
  }
};
