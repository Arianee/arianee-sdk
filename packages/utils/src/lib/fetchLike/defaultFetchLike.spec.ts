import fetch from 'node-fetch';

import { defaultFetchLike } from './defaultFetchLike';
jest.mock('node-fetch');

declare const global: {
  window: { fetch: typeof fetch } | undefined;
};

describe('defaultFetchLike', () => {
  it('should use dom fetch if window is defined and call it with correct params', async () => {
    const mockedFetch = jest.fn().mockImplementation(() => {
      return Promise.resolve();
    });
    global.window!.fetch = mockedFetch as unknown as typeof fetch;

    await defaultFetchLike('https://test.com/', {
      timeout: 2000,
      method: 'post',
    });
    expect(mockedFetch).toHaveBeenCalledWith('https://test.com/', {
      signal: expect.any(AbortSignal),
      method: 'post',
      redirect: 'follow',
    });

    delete global.window;
  });

  it('should use node-fetch if window is not defined and call it with correct params', async () => {
    (fetch as unknown as jest.Mock).mockReturnValue(Promise.resolve());

    await defaultFetchLike('https://test.com/', {
      timeout: 2000,
      method: 'post',
    });

    expect(fetch).toHaveBeenCalledWith('https://test.com/', {
      signal: expect.any(AbortSignal),
      method: 'post',
      redirect: 'follow',
    });
  });

  it('should throw if the request timeouts', async () => {
    (fetch as unknown as jest.Mock).mockImplementation(
      () =>
        new Promise<void>((resolve, _) => {
          setTimeout(() => resolve(), 3000);
        }) as any
    );

    const promise = defaultFetchLike('https://test.com/', {
      timeout: 1,
      method: 'post',
    });

    await expect(promise).rejects.toThrowError(/timed out after 1ms/gi);
  });
});
