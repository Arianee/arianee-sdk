// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import ArianeeProtocolClient, {
  ProtocolClientV1,
  ProtocolClientV2,
} from '@arianee/arianee-protocol-client';
import { Core } from '@arianee/core';
import { ContractTransactionResponse } from 'ethers';

import { callWrapper } from './callWrapper';

jest.mock('@arianee/arianee-protocol-client');
jest.spyOn(console, 'error').mockImplementation();

describe('transactionWrapper', () => {
  const arianeeProtocolClient = new ArianeeProtocolClient(
    Core.fromPrivateKey(
      '0xc53e9fc60d0ed7edd7d98a61fe6cb0cff4e91752cc5a52522985f2a44fc93208'
    )
  );

  // set prototype to those of ProtocolClientV1 so that instanceof check passes
  const RealProtocolClientV1 = jest.requireActual(
    '@arianee/arianee-protocol-client'
  ).ProtocolClientV1;
  const mockProtocolClientV1 = new ProtocolClientV1(
    {} as any,
    {} as any,
    {} as any
  );
  Object.setPrototypeOf(mockProtocolClientV1, RealProtocolClientV1.prototype);

  const RealProtocolClientV2 = jest.requireActual(
    '@arianee/arianee-protocol-client'
  ).ProtocolClientV2;
  const mockProtocolClientV2 = new ProtocolClientV2(
    {} as any,
    {} as any,
    {} as any
  );
  Object.setPrototypeOf(mockProtocolClientV2, RealProtocolClientV2.prototype);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should throw if the protocol is not supported', async () => {
    const connectSpy = jest
      .spyOn(arianeeProtocolClient, 'connect')
      .mockResolvedValue({} as any);

    await expect(
      callWrapper(arianeeProtocolClient, 'mockProtocol', {
        protocolV1Action: async () => ({} as ContractTransactionResponse),
        protocolV2Action: async () => ({} as ContractTransactionResponse),
      })
    ).rejects.toThrowError(/The wrapper does not support/gi);

    expect(connectSpy).toHaveBeenCalledWith('mockProtocol', undefined);
  });

  it('should call the protocol v1 action and return the result', async () => {
    const protocolV1Action = jest.fn().mockResolvedValue('mock');

    const connectSpy = jest
      .spyOn(arianeeProtocolClient, 'connect')
      .mockResolvedValue(mockProtocolClientV1);

    const res = await callWrapper(arianeeProtocolClient, 'mockProtocol', {
      protocolV1Action,
      protocolV2Action() {
        throw new Error('should not be called');
      },
    });

    expect(connectSpy).toHaveBeenCalledWith('mockProtocol', undefined);
    expect(protocolV1Action).toHaveBeenCalledWith(mockProtocolClientV1);
    expect(res).toEqual('mock');
  });

  it('should call the protocol v2 action and return the result', async () => {
    const protocolV2Action = jest.fn().mockResolvedValue('mock');

    const connectSpy = jest
      .spyOn(arianeeProtocolClient, 'connect')
      .mockResolvedValue(mockProtocolClientV2);

    const res = await callWrapper(arianeeProtocolClient, 'mockProtocol', {
      protocolV1Action() {
        throw new Error('should not be called');
      },
      protocolV2Action,
    });

    expect(connectSpy).toHaveBeenCalledWith('mockProtocol', undefined);
    expect(protocolV2Action).toHaveBeenCalledWith(mockProtocolClientV2);
    expect(res).toEqual('mock');
  });

  it('should throw if the protocol v1 action fails', async () => {
    const protocolV1Action = jest
      .fn()
      .mockRejectedValue(new Error('v1 action error'));

    jest
      .spyOn(arianeeProtocolClient, 'connect')
      .mockResolvedValue(mockProtocolClientV1);

    await expect(
      callWrapper(arianeeProtocolClient, 'mockProtocol', {
        protocolV1Action,
        protocolV2Action() {
          throw new Error('should not be called');
        },
      })
    ).rejects.toThrow(/error while executing the protocol v1 action/gi);
  });

  it('should throw if the protocol v2 action fails', async () => {
    const protocolV2Action = jest
      .fn()
      .mockRejectedValue(new Error('v2 action error'));

    jest
      .spyOn(arianeeProtocolClient, 'connect')
      .mockResolvedValue(mockProtocolClientV2);

    await expect(
      callWrapper(arianeeProtocolClient, 'mockProtocol', {
        protocolV1Action() {
          throw new Error('should not be called');
        },
        protocolV2Action,
      })
    ).rejects.toThrow(/error while executing the protocol v2 action/gi);
  });
});

describe('callWrapper — transient RPC retry', () => {
  const arianeeProtocolClient = new ArianeeProtocolClient(
    Core.fromPrivateKey(
      '0xc53e9fc60d0ed7edd7d98a61fe6cb0cff4e91752cc5a52522985f2a44fc93208'
    )
  );

  const RealProtocolClientV1 = jest.requireActual(
    '@arianee/arianee-protocol-client'
  ).ProtocolClientV1;
  const mockProtocolClientV1 = new ProtocolClientV1(
    {} as any,
    {} as any,
    {} as any
  );
  Object.setPrototypeOf(mockProtocolClientV1, RealProtocolClientV1.prototype);

  /** Shape of the failure seen in production: a Cloudflare 1101 behind the RPC. */
  const cloudflare1101 = () =>
    Object.assign(new Error('server response 500 Internal Server Error'), {
      code: 'SERVER_ERROR',
      info: {
        requestUrl: 'https://poa.arianee.net',
        responseBody: 'error code: 1101\n',
        responseStatus: '500 Internal Server Error',
      },
    });

  /** A real answer from the chain: the token does not exist. Must not be replayed. */
  const callException = () =>
    Object.assign(new Error('missing revert data'), {
      code: 'CALL_EXCEPTION',
    });

  // Keep the backoff out of the test runtime; the delay itself is not asserted.
  const fastRetry = { retryDelayMs: 1 };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'warn').mockImplementation();
    jest
      .spyOn(arianeeProtocolClient, 'connect')
      .mockResolvedValue(mockProtocolClientV1);
  });

  it('replays a transient RPC error and returns the retried result', async () => {
    const protocolV1Action = jest
      .fn()
      .mockRejectedValueOnce(cloudflare1101())
      .mockResolvedValue('mock');

    const res = await callWrapper(
      arianeeProtocolClient,
      'mockProtocol',
      {
        protocolV1Action,
        protocolV2Action() {
          throw new Error('should not be called');
        },
      },
      undefined,
      fastRetry
    );

    expect(res).toEqual('mock');
    expect(protocolV1Action).toHaveBeenCalledTimes(2);
  });

  it('does not replay a CALL_EXCEPTION, which is a real answer from the chain', async () => {
    const protocolV1Action = jest.fn().mockRejectedValue(callException());

    await expect(
      callWrapper(
        arianeeProtocolClient,
        'mockProtocol',
        {
          protocolV1Action,
          protocolV2Action() {
            throw new Error('should not be called');
          },
        },
        undefined,
        fastRetry
      )
    ).rejects.toThrow(/error while executing the protocol v1 action/gi);

    expect(protocolV1Action).toHaveBeenCalledTimes(1);
  });

  it('gives up after maxRetries and keeps the original error as cause', async () => {
    const protocolV1Action = jest.fn().mockRejectedValue(cloudflare1101());

    const promise = callWrapper(
      arianeeProtocolClient,
      'mockProtocol',
      {
        protocolV1Action,
        protocolV2Action() {
          throw new Error('should not be called');
        },
      },
      undefined,
      { ...fastRetry, maxRetries: 2 }
    );

    await expect(promise).rejects.toThrow(
      /error while executing the protocol v1 action/gi
    );
    // first attempt + 2 retries
    expect(protocolV1Action).toHaveBeenCalledTimes(3);

    await promise.catch((e) => {
      expect((e.cause as { code?: string })?.code).toEqual('SERVER_ERROR');
    });
  });

  it('honours maxRetries: 0 by not replaying at all', async () => {
    const protocolV1Action = jest.fn().mockRejectedValue(cloudflare1101());

    await expect(
      callWrapper(
        arianeeProtocolClient,
        'mockProtocol',
        {
          protocolV1Action,
          protocolV2Action() {
            throw new Error('should not be called');
          },
        },
        undefined,
        { ...fastRetry, maxRetries: 0 }
      )
    ).rejects.toThrow(/error while executing the protocol v1 action/gi);

    expect(protocolV1Action).toHaveBeenCalledTimes(1);
  });
});
