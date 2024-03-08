import { cachedFetchLike } from './cachedFetchLike';
describe('cachedFetchLike', () => {
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
    const cache = new Map<string, Promise<Response>>();

    const fetchLike = jest.fn().mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          key: 'value',
        })
      )
    );

    const _cachedFetchLike = cachedFetchLike(fetchLike, cache);

    await expect(_cachedFetchLike(url)).resolves.toBeInstanceOf(Response);
    expect(cache.has(url)).toBeTruthy();
  });

  it('should work with other urls', async () => {
    const cache = new Map<string, Promise<Response>>();

    const fetchLike = jest
      .fn()
      .mockResolvedValueOnce(new Response(JSON.stringify('hello world')));

    const _cachedFetchLike = cachedFetchLike(fetchLike, cache);

    await expect(
      _cachedFetchLike('https://bitcoin.org')
    ).resolves.toBeInstanceOf(Response);
    expect(cache.has('https://bitcoin.org')).toBeFalsy();
  });
});
