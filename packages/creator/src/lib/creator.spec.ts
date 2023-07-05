import { defaultFetchLike } from '@arianee/utils';
import Creator from './creator';
import Core from '@arianee/core';
import * as arianeeProtocolClientModule from '@arianee/arianee-protocol-client';

jest.mock('@arianee/arianee-protocol-client');
jest.spyOn(console, 'error').mockImplementation();

describe('Creator', () => {
  const core = Core.fromRandom();
  const creatorAddress = `0x${'a'.repeat(40)}`;
  let creator: Creator;

  beforeEach(() => {
    creator = new Creator({
      core,
      creatorAddress,
    });

    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should use default fetch like if not passed', () => {
      const creator = new Creator({
        core,
        creatorAddress,
      });

      expect(creator['fetchLike']).toBe(defaultFetchLike);
    });

    it('should use passed fetch like', () => {
      const fetchLike = jest.fn();
      const creator = new Creator({
        core,
        creatorAddress,
        fetchLike,
      });

      expect(creator['fetchLike']).toBe(fetchLike);
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
        .mockResolvedValue({
          v1: {} as unknown as arianeeProtocolClientModule.ProtocolClientV1,
        });

      const creator = new Creator({
        core,
        creatorAddress,
      });

      const connected = await creator.connect('slug');

      expect(connected).toBe(true);
      expect(creator.connected).toBe(true);
    });
  });

  describe('getAvailableSmartAssetId', () => {
    it('should call the v1 contract with correct params and return the id', async () => {
      jest
        .spyOn(creator as any, 'requiresCreatorToBeConnected')
        .mockReturnValue(true);

      const ownerOfSpy = jest.fn().mockRejectedValue(new Error('owned by 0x0'));

      const callWrapperSpy = jest

        .spyOn(arianeeProtocolClientModule, 'callWrapper')
        .mockImplementation(async (_, __, actions) => {
          await actions.protocolV1Action({
            smartAssetContract: {
              ownerOf: ownerOfSpy,
            },
          } as any);
        });

      const id = await creator.getAvailableSmartAssetId();

      expect(ownerOfSpy).toHaveBeenCalledWith(expect.any(Number));

      expect(callWrapperSpy).toHaveBeenCalledWith(
        creator['arianeeProtocolClient'],
        creator['slug'],
        {
          protocolV1Action: expect.any(Function),
        },
        undefined
      );

      expect(id).toEqual(expect.any(Number));
    });
  });

  describe('reserveSmartAssetId', () => {
    it('should call the v1 contract with correct params and return the id', async () => {
      jest
        .spyOn(creator as any, 'requiresCreatorToBeConnected')
        .mockReturnValue(true);

      jest
        .spyOn(creator as any, 'isSmartAssetIdAvailable')
        .mockReturnValue(true);

      jest.spyOn(creator, 'getCreditBalance').mockResolvedValue(BigInt(1));

      const reserveTokenSpy = jest.fn();

      const transactionWrapperSpy = jest
        .spyOn(arianeeProtocolClientModule, 'transactionWrapper')
        .mockImplementation();

      await creator.reserveSmartAssetId(123);

      const { protocolV1Action } = transactionWrapperSpy.mock.calls[0][2];

      await protocolV1Action({
        storeContract: {
          reserveToken: reserveTokenSpy,
        },
      } as any);

      expect(reserveTokenSpy).toHaveBeenCalledWith(123, expect.any(String), {});

      expect(transactionWrapperSpy).toHaveBeenCalledWith(
        creator['arianeeProtocolClient'],
        creator['slug'],
        {
          protocolV1Action: expect.any(Function),
        },
        undefined
      );
    });
  });
});
