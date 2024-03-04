import { cachedFetchLike } from './cachedFetchLike';

describe('cachedFetchLike', () => {
  it('should work with the cached urls', async () => {
    const cache = new Map<string, string>();

    const fetchLike = jest.fn().mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          $schema: 'https://cert.arianee.org/version1/ArianeeEvent-i18n.json',
        })
      )
    );

    const _cachedFetchLike = cachedFetchLike(fetchLike, cache);

    await expect(
      _cachedFetchLike(
        'https://cert.arianee.org/version1/ArianeeEvent-i18n.json'
      )
    ).resolves.toBeInstanceOf(Response);
    expect(
      cache.has('https://cert.arianee.org/version1/ArianeeEvent-i18n.json')
    ).toBeTruthy();
  });

  it('should work with other urls', async () => {
    const cache = new Map<string, string>();

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
