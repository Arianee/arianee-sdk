/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { ArianeeApiClient, smartAssetInfo } from '@arianee/arianee-api-client';
import { defaultFetchLike, retryFetchLike } from '@arianee/utils';

import Creator, { TransactionStrategy } from '../../creator';

/**
 * Deliberately NOT the default client of `ArianeeApiClient`, which wraps its
 * fetch in `cachedFetchLike(..., { timeToLive: 5 min })`. `owner` moves on every
 * transfer and `imprint` on every update, so a five minute old answer would be
 * wrong in exactly the flows that read them. Retries are kept: they cost nothing
 * on a healthy call and cover a blip on the API itself.
 */
const arianeeApiClient = new ArianeeApiClient(
  undefined,
  retryFetchLike(defaultFetchLike, 3)
);

/**
 * Reads a smart asset from the Arianee API instead of the chain.
 *
 * `owner`, `issuer` and `imprint` are all indexed, so the three reads that used
 * to cost an `ownerOf` / `issuerOf` / `tokenImprint` RPC call each are served by
 * a single HTTP call that does not depend on the protocol's RPC gateway being
 * up. That gateway is the weak link: a Cloudflare 1101 on the POA worker was
 * enough to fail a pairing.
 *
 * Returns `null` when the API does not know the token. That is NOT the same as
 * "the token does not exist on chain": the API is an indexer and lags behind a
 * fresh mint. Callers must treat `null` as "unknown" and fall back to the chain,
 * never as "free".
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
  } catch {
    // The client throws on any non-2xx, 404 included, without exposing the
    // status. An unknown token and an unreachable API are therefore the same
    // signal here, and both mean "ask the chain".
    return null;
  }
};
