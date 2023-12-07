import AsyncRetry from 'async-retry';

/**
 * Takes a fetchLike method and wraps it in a retry mechanism.
 * @param fetchLike the fetchLike method to wrap
 * @returns a wrapped fetchLike method that will retry on failure
 */
export const retryFetchLike = (
  fetchLike: typeof fetch,
  retries = 3
): typeof fetch => {
  return (...args: Parameters<typeof fetch>) =>
    AsyncRetry(
      async () => {
        return await fetchLike(...args);
      },
      {
        retries,
        factor: 2,
        minTimeout: 1000,
      }
    );
};
