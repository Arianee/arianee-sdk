# @arianee/utils

This library contains various utilities that are used across the Arianee projects.

## cachedFetchLike

A wrapper for `fetch` like functions that caches the response for well-known arianee urls for a given time (default 1 hour, can be overridden by setting the `options.timeToLive` property, the cache map can also be passed with `options.cache`).

Usage:

```typescript
// simplest usage
cachedFetchLike(fetch);

// can be composed with other fetch wrappers
cachedFetchLike(retryFetchLike(defaultFetchLike));
```

## retryFetchLike

A wrapper for `fetch` that retry the request on failure.

Usage:

```typescript
// simplest usage
retryFetchLike(fetch);

// can be composed with other fetch wrappers, retries can be passed as a second optional argument
retryFetchLike(defaultFetchLike, 2);
```

## defaultFetchLike

A `fetch` like function that works in node and in the browser by selecting the appropriate implementation based on environment (`node-fetch` or DOM `fetch`).

Usage:

```typescript
defaultFetchLike('https://google.com');
```
