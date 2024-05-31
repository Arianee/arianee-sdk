import { cachedFetchLike, CachedFetchLikeCache } from './cachedFetchLike';

describe('cachedFetchLike', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(0);
  });

  it.each([
    {
      url: 'https://cert.arianee.org/version',
    },
    {
      url: 'https://api.arianee.com/protocol?q=',
    },
    {
      url: 'https://cert.arianee.org/contractAddresses',
    },
  ])('should work with the cached urls', async ({ url }) => {
    const cache: CachedFetchLikeCache = new Map();

    const fetchLike = jest.fn().mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          key: 'value',
        })
      )
    );

    const _cachedFetchLike = cachedFetchLike(fetchLike, { cache });

    await expect(_cachedFetchLike(url)).resolves.toBeInstanceOf(Response);
    expect(cache.has(url)).toBeTruthy();
  });

  it.each([
    {
      url: 'https://cert.arianee.org/version',
    },
    {
      url: 'https://api.arianee.com/protocol?q=',
    },
    {
      url: 'https://cert.arianee.org/contractAddresses',
    },
  ])('should work with timeToLive option', async ({ url }) => {
    const cache = new Map();
    const setSpy = jest.spyOn(cache, 'set');
    const deleteSpy = jest.spyOn(cache, 'delete');
    const getSpy = jest.spyOn(cache, 'get');

    const fetchLike = jest.fn().mockImplementation(
      () =>
        new Response(
          JSON.stringify({
            key: 'value',
          })
        )
    );

    const _cachedFetchLike = cachedFetchLike(fetchLike, {
      cache: cache,
      timeToLive: 1000,
    });

    // first call where the cache is filled
    const res1 = await _cachedFetchLike(url);
    expect(res1).toBeInstanceOf(Response);
    expect(setSpy).toHaveBeenNthCalledWith(1, url, {
      addedAt: 0,
      promise: expect.any(Promise),
    });

    // second call returned from cache (no delete)
    const res2 = await _cachedFetchLike(url);
    expect(res2).toBeInstanceOf(Response);
    expect(getSpy).toHaveBeenNthCalledWith(1, url);
    expect(deleteSpy).not.toHaveBeenCalledWith(url);

    // third call with cache expired
    jest.advanceTimersByTime(1001);
    const res3 = await _cachedFetchLike(url);

    expect(res3).toBeInstanceOf(Response);
    expect(deleteSpy).toHaveBeenCalledWith(url);
    expect(setSpy).toHaveBeenNthCalledWith(2, url, {
      addedAt: 1001,
      promise: expect.any(Promise),
    });
  });

  it('should work with other urls', async () => {
    const cache: CachedFetchLikeCache = new Map();

    const fetchLike = jest
      .fn()
      .mockResolvedValueOnce(new Response(JSON.stringify('hello world')));

    const _cachedFetchLike = cachedFetchLike(fetchLike, { cache });

    await expect(
      _cachedFetchLike('https://bitcoin.org')
    ).resolves.toBeInstanceOf(Response);
    expect(cache.has('https://bitcoin.org')).toBeFalsy();
  });
});
