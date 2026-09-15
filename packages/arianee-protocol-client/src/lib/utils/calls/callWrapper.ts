import { Protocol } from '@arianee/common-types';

import ArianeeProtocolClient from '../../arianeeProtocolClient';
import ProtocolClientV1 from '../../v1/protocolClientV1';
import ProtocolClientV2 from '../../v2/protocolClientV2';

/**
 * ethers error codes that mean "the RPC gateway failed to answer", as opposed to
 * "the contract answered no". Only these are worth replaying.
 *
 * `CALL_EXCEPTION` is deliberately absent: it is a real answer from the chain and
 * several callers rely on it (`isSmartAssetIdAvailable` reads a revert on
 * `ownerOf` as "this token id is free"). Retrying it would only slow the nominal
 * path down.
 */
const RETRYABLE_ERROR_CODES = ['SERVER_ERROR', 'NETWORK_ERROR', 'TIMEOUT'];

export interface CallWrapperRetryOptions {
  /** Extra attempts after the first one. 0 disables retrying. Defaults to 2. */
  maxRetries?: number;
  /** Base delay of the exponential backoff, in ms. Defaults to 300. */
  retryDelayMs?: number;
}

const DEFAULT_MAX_RETRIES = 2;
const DEFAULT_RETRY_DELAY_MS = 300;

const isRetryableRpcError = (error: unknown): boolean => {
  const code = (error as { code?: unknown } | null)?.code;
  return typeof code === 'string' && RETRYABLE_ERROR_CODES.includes(code);
};

const sleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

/** Attaches the original error to the wrapper so `code`/`info` stay reachable. */
const withCause = (error: Error, cause: unknown): Error => {
  (error as Error & { cause?: unknown }).cause = cause;
  return error;
};

/**
 * Exponential backoff with equal jitter. Equal rather than full jitter: full
 * jitter can draw a near-zero delay, which is the hammering this prevents.
 */
const backoffDelay = (attempt: number, baseDelayMs: number): number => {
  const window = baseDelayMs * Math.pow(2, attempt);
  return window / 2 + Math.random() * (window / 2);
};

/**
 * Runs a protocol read, replaying it when the RPC gateway fails transiently.
 *
 * The gateway in front of the nodes fails on its own (a Cloudflare 1101 raised by
 * a worker timeout, a throttled node, a dropped connection) and that surfaces to
 * the caller as a plain read failure. Every caller of `callWrapper` is an
 * idempotent read, so replaying one is safe. Writes go through
 * `transactionWrapper` and are NOT covered here.
 */
const callWithRetry = async <T>(
  action: () => Promise<T>,
  { maxRetries, retryDelayMs }: Required<CallWrapperRetryOptions>
): Promise<T> => {
  for (let attempt = 0; ; attempt++) {
    try {
      return await action();
    } catch (e) {
      if (attempt >= maxRetries || !isRetryableRpcError(e)) throw e;

      const delay = backoffDelay(attempt, retryDelayMs);
      // Surface the retry: a fault that is silently absorbed is a fault nobody
      // can size afterwards.
      console.warn(
        `[callWrapper] transient RPC error (${
          (e as { code?: string }).code
        }), retrying in ${Math.round(delay)}ms (attempt ${attempt + 2}/${
          maxRetries + 1
        })`
      );
      await sleep(delay);
    }
  }
};

export const callWrapper = async <T>(
  arianeeProtocolClient: ArianeeProtocolClient,
  protocolName: Protocol['name'],
  actions: {
    protocolV1Action: (v1: ProtocolClientV1) => Promise<T>;
    protocolV2Action: (v2: ProtocolClientV2) => Promise<T>;
  },
  connectOptions?: Parameters<ArianeeProtocolClient['connect']>[1],
  retryOptions?: CallWrapperRetryOptions
): Promise<T> => {
  const protocol = await arianeeProtocolClient.connect(
    protocolName,
    connectOptions
  );

  if (
    !(protocol instanceof ProtocolClientV1) &&
    !(protocol instanceof ProtocolClientV2)
  )
    throw new Error(
      `The wrapper does not support this protocol (${protocolName} / ${protocol})`
    );

  const retry: Required<CallWrapperRetryOptions> = {
    maxRetries: retryOptions?.maxRetries ?? DEFAULT_MAX_RETRIES,
    retryDelayMs: retryOptions?.retryDelayMs ?? DEFAULT_RETRY_DELAY_MS,
  };

  if (protocol instanceof ProtocolClientV1) {
    try {
      return await callWithRetry(
        () => actions.protocolV1Action(protocol),
        retry
      );
    } catch (e) {
      console.error(e);
      const message = e instanceof Error ? e.message : '';
      // Keep the original error reachable: the wrapped message alone loses the
      // ethers `code`/`info` that says which gateway failed and how. Assigned
      // rather than passed to the constructor, whose `cause` option is not in
      // the lib this package targets.
      throw withCause(
        new Error('Error while executing the protocol v1 action  ' + message),
        e
      );
    }
  } else {
    try {
      return await callWithRetry(
        () => actions.protocolV2Action(protocol),
        retry
      );
    } catch (e) {
      console.error(e);
      const message = e instanceof Error ? e.message : '';
      throw withCause(
        new Error('Error while executing the protocol v2 action ' + message),
        e
      );
    }
  }
};
