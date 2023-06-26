type FetchParameters = Parameters<typeof fetch>;

/**
 * A function that uses the same signature as the fetch API
 * and that automatically uses the window's fetch or node-fetch
 * based on environment. Also has a timeout feature, timeout
 * is set to 30s by default but can be set in init.timeout
 * @param input fetch API input
 * @param init fetch API init + timeout (number, in ms)
 * @returns Promise<Response>
 */
export const defaultFetchLike = (
  input: FetchParameters[0],
  init?: FetchParameters[1] & { timeout?: number }
): Promise<Response> => {
  let _fetch: typeof fetch;

  if (typeof window === 'undefined') {
    _fetch = require('node-fetch');
  } else {
    _fetch = window.fetch.bind(window);
  }

  const controller = new AbortController();
  const timeout = init?.timeout ?? 30000;

  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => {
      controller.abort();
      reject(new Error(`Request to ${input} timed out after ${timeout}ms`));
    }, timeout);
  });

  delete init?.timeout;

  const fetchPromise = _fetch(input, {
    signal: controller.signal,
    ...init,
    redirect: 'follow',
  });

  return Promise.race([fetchPromise, timeoutPromise]) as Promise<Response>;
};
