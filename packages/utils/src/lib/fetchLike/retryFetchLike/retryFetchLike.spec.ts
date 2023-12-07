import { retryFetchLike } from './retryFetchLike';

describe('retryFetchLike', () => {
  it('should retry if fetchLike throws', async () => {
    const fetchLike = jest
      .fn()
      .mockRejectedValueOnce(new Error('error'))
      .mockResolvedValueOnce('ok');
    const _retryFetchLike = retryFetchLike(fetchLike);

    await expect(_retryFetchLike('https://test.com')).resolves.toEqual('ok');
    expect(fetchLike).toHaveBeenCalledTimes(2);
  });

  it('should not retry if fetchLike does not throw', async () => {
    const fetchLike = jest.fn().mockResolvedValueOnce('ok');
    const _retryFetchLike = retryFetchLike(fetchLike);

    await expect(_retryFetchLike('https://test.com')).resolves.toEqual('ok');
    expect(fetchLike).toHaveBeenCalledTimes(1);
  });
});
