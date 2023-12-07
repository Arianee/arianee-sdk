import * as arianeeProtocolClientModule from '@arianee/arianee-protocol-client';
import Core from '@arianee/core';
import * as utils from '@arianee/utils';

import Creator from './creator';

jest.mock('@arianee/arianee-protocol-client');
jest.mock('@arianee/arianee-privacy-gateway-client');

jest.mock('@arianee/utils', () => {
  const originalUtils = jest.requireActual('@arianee/utils');
  return {
    ...originalUtils,
    retryFetchLike: jest.fn(),
  };
});

jest.spyOn(console, 'error').mockImplementation();

describe('Creator', () => {
  const core = Core.fromRandom();
  const creatorAddress = `0x${'a'.repeat(40)}`;
  let creator: Creator<'WAIT_TRANSACTION_RECEIPT'>;

  beforeEach(() => {
    creator = new Creator({
      core,
      creatorAddress,
      transactionStrategy: 'WAIT_TRANSACTION_RECEIPT',
    });

    Object.defineProperty(Creator.prototype, 'connected', {
      get: () => true,
    });

    Object.defineProperty(Creator.prototype, 'slug', {
      get: () => 'testnet',
    });

    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should use a retryFetchLike created with the defaultFetchLike if no fetch like passed', () => {
      (utils.retryFetchLike as jest.Mock).mockReturnValue(
        utils.defaultFetchLike
      );

      const creator = new Creator({
        core,
        creatorAddress,
        transactionStrategy: 'WAIT_TRANSACTION_RECEIPT',
      });

      expect(creator['fetchLike']).toBe(utils.defaultFetchLike);
      expect(utils.retryFetchLike).toHaveBeenCalledWith(utils.defaultFetchLike);
    });

    it('should use passed fetch like', () => {
      const fetchLike = jest.fn();
      const creator = new Creator({
        core,
        creatorAddress,
        fetchLike,
        transactionStrategy: 'WAIT_TRANSACTION_RECEIPT',
      });

      expect(creator['fetchLike']).toBe(fetchLike);
    });

    it('should use passed protocolDetailsResolver if passed', () => {
      const protocolDetailsResolver = jest.fn();

      const creator = new Creator({
        core,
        creatorAddress,
        protocolDetailsResolver,
        transactionStrategy: 'WAIT_TRANSACTION_RECEIPT',
      });

      expect(
        arianeeProtocolClientModule.ArianeeProtocolClient
      ).toHaveBeenCalledWith(creator['core'], {
        fetchLike: expect.any(Function),
        protocolDetailsResolver,
      });
    });
  });

  describe('connect', () => {
    it('should throw if connection failed', async () => {
      jest
        .spyOn(
          arianeeProtocolClientModule.ArianeeProtocolClient.prototype,
          'connect'
        )
        .mockRejectedValueOnce('error');

      const creator = new Creator({
        core,
        creatorAddress,
        transactionStrategy: 'WAIT_TRANSACTION_RECEIPT',
      });

      await expect(creator.connect('slug')).rejects.toThrow(
        /Unable to connect to protocol slug, see error above for more details/gi
      );
    });

    it('should return true if connection was successful', async () => {
      jest
        .spyOn(
          arianeeProtocolClientModule.ArianeeProtocolClient.prototype,
          'connect'
        )
        .mockResolvedValue(
          {} as unknown as arianeeProtocolClientModule.ProtocolClientV1
        );

      const creator = new Creator({
        core,
        creatorAddress,
        transactionStrategy: 'WAIT_TRANSACTION_RECEIPT',
      });

      const connected = await creator.connect('slug');

      expect(connected).toBe(true);
      expect(creator.connected).toBe(true);
    });
  });
});
