export type CachedFetchLikeCache = Map<
  string,
  { promise: Promise<Response>; addedAt: number }
>;
const defaultCache: CachedFetchLikeCache = new Map();

const isCachableURL = (url: string) =>
  [
    'https://cert.arianee.org/version',
    'https://api.arianee.com/protocol?q=',
    'https://cert.arianee.org/contractAddresses',
  ].some((prefix) => url.startsWith(prefix));

/**
 * A fetch like wrapper that caches convention files (files that start with https://cert.arianee.org/version)
 * @param fetchLike the fetchLike to use to fetch urls
 * @param options options for the cache
 * @param options.cache (optional) the map to use as the cache
 * @param options.timeToLive (optional) the time to live of the cache in milliseconds, default: 60*60*1000 (1 hour)
 * @returns a wrapper for a fetch like method that caches the responses of well-known URLs
 */
export const cachedFetchLike = (
  fetchLike: typeof fetch,
  options: {
    cache?: CachedFetchLikeCache;
    timeToLive?: number;
  } = {}
): typeof fetch => {
  return async (...params: Parameters<typeof fetch>) => {
    const url = params[0].toString();
    const _cache = options.cache ?? defaultCache;
    const timeToLive = options.timeToLive ?? 60 * 60 * 1000;

    if (_cache.has(url)) {
      const { promise, addedAt } = _cache.get(url)!;

      if (Date.now() - addedAt >= timeToLive) {
        _cache.delete(url);
      } else {
        return promise;
      }
    }

    if (isCachableURL(url)) {
      const addedAt = Date.now();

      const fetchPromise = (async () => {
        try {
          const response = await fetchLike(...params);
          const text = await response.text();

          if (typeof Response === 'undefined') {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            global.Response = require('node-fetch').Response;
          }

          const newResponse = new Response(text, { status: 200 });

          // prevent "body stream already read" error
          newResponse.json = async () => JSON.parse(text);
          newResponse.text = async () => text;
          return newResponse;
        } catch (error) {
          _cache.delete(url);
          throw error;
        }
      })();

      _cache.set(url, { promise: fetchPromise, addedAt });

      return fetchPromise;
    }

    // For non-Arianee schema URLs, just perform the fetch without caching
    return fetchLike(...params);
  };
};
