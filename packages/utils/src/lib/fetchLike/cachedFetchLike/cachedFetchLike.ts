const defaultCache = new Map<string, Promise<Response>>();

const isCachableURL = (url: string) =>
  [
    'https://cert.arianee.org/version',
    'https://api.arianee.com/protocol?q=',
    'https://cert.arianee.org/contractAddresses',
  ].some((prefix) => url.startsWith(prefix));

/**
 * A fetch like wrapper that caches convention files (files that start with https://cert.arianee.org/version)
 * @param fetchLike the fetchLike to use to fetch urls
 * @param _cache (optional) the map to use as the cache
 * @returns a wrapped fetchLike method that will retry on failure
 */
export const cachedFetchLike = (
  fetchLike: typeof fetch,
  cache?: Map<string, Promise<Response>>
): typeof fetch => {
  return async (...params: Parameters<typeof fetch>) => {
    const url = params[0].toString();
    const _cache = cache ?? defaultCache;

    if (_cache.has(url)) {
      return _cache.get(url)!;
    }

    if (isCachableURL(url)) {
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

      _cache.set(url, fetchPromise);

      return fetchPromise;
    }

    // For non-Arianee schema URLs, just perform the fetch without caching
    return fetchLike(...params);
  };
};
