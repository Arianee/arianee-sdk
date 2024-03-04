const defaultCache = new Map<string, string>();

const isArianeeSchema = (url: string) =>
  url.startsWith('https://cert.arianee.org/version');

const getFromCache = (url: string, cache: Map<string, string>) => {
  if (!cache.has(url)) return;
  return cache.get(url);
};

const storeInCache = async (
  url: string,
  response: Response,
  cache: Map<string, string>
): Promise<string> => {
  const text = await response.text();
  cache.set(url, text);
  return text;
};

/**
 * A fetch like wrapper that caches convention files (files that start with https://cert.arianee.org/version)
 * @param fetchLike the fetchLike to use to fetch urls
 * @param cache (optional) the map to use as the cache
 * @returns a wrapped fetchLike method that will retry on failure
 */
export const cachedFetchLike = (
  fetchLike: typeof fetch,
  cache?: Map<string, string>
): typeof fetch => {
  return async (...params: Parameters<typeof fetch>) => {
    const url = params[0].toString();

    const cached = getFromCache(url, cache ?? defaultCache);
    if (cached) return new Response(cached, { status: 200 });

    const response = await fetchLike(...params);

    if (isArianeeSchema(url)) {
      const stored = await storeInCache(url, response, cache ?? defaultCache);
      return new Response(stored, { status: 200 });
    }

    return response;
  };
};
