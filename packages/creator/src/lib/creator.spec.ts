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

  describe('reserveSmartAssetId', () => {
    it('should call the v1 contract with correct params and return the id', async () => {
      jest
        .spyOn(creator.utils, 'requiresCreatorToBeConnected')
        .mockImplementation();

      jest
        .spyOn(creator.utils, 'isSmartAssetIdAvailable')
        .mockResolvedValue(true);

      jest
        .spyOn(creator.utils, 'getCreditBalance')
        .mockResolvedValue(BigInt(1));

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

  describe('destroySmartAsset', () => {
    it('should call the v1 contract with correct params and return the id', async () => {
      jest
        .spyOn(creator.utils as any, 'requiresCreatorToBeConnected')
        .mockReturnValue(true);

      jest
        .spyOn(creator.utils as any, 'getSmartAssetOwner')
        .mockReturnValue(core.getAddress());

      const transferFromSpy = jest.fn();

      const transactionWrapperSpy = jest
        .spyOn(arianeeProtocolClientModule, 'transactionWrapper')
        .mockImplementation();

      await creator.destroySmartAsset('123');

      const { protocolV1Action } = transactionWrapperSpy.mock.calls[0][2];

      await protocolV1Action({
        smartAssetContract: {
          transferFrom: transferFromSpy,
        },
      } as any);

      expect(transferFromSpy).toHaveBeenCalledWith(
        core.getAddress(),
        '0x000000000000000000000000000000000000dead',
        '123',
        {}
      );

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

  describe('recoverSmartAsset', () => {
    it('should call the v1 contract with correct params and return the id', async () => {
      jest
        .spyOn(creator.utils, 'requiresCreatorToBeConnected')
        .mockImplementation();

      jest
        .spyOn(creator as any, 'getSmartAssetIssuer')
        .mockReturnValue(core.getAddress());

      const recoverTokenToIssuerSpy = jest.fn();

      const transactionWrapperSpy = jest
        .spyOn(arianeeProtocolClientModule, 'transactionWrapper')
        .mockImplementation();

      await creator.recoverSmartAsset('123');

      const { protocolV1Action } = transactionWrapperSpy.mock.calls[0][2];

      await protocolV1Action({
        smartAssetContract: {
          recoverTokenToIssuer: recoverTokenToIssuerSpy,
        },
      } as any);

      expect(recoverTokenToIssuerSpy).toHaveBeenCalledWith('123', {});

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

  describe('createAndStoreSmartAsset', () => {
    it('should call the v1 contract with correct params and return the id', async () => {
      const requiresCreatorToBeConnectedSpy = jest
        .spyOn(creator.utils, 'requiresCreatorToBeConnected')
        .mockImplementation();

      const checkCreateSmartAssetParametersSpy = jest
        .spyOn(creator as any, 'checkCreateSmartAssetParameters')
        .mockImplementation();

      const checkSmartAssetCreditBalanceSpy = jest
        .spyOn(creator as any, 'checkSmartAssetCreditBalance')
        .mockImplementation();

      const storeSmartAssetSpy = jest
        .spyOn(creator as any, 'storeSmartAsset')
        .mockImplementation();

      const getCreateSmartAssetParams = jest
        .spyOn(creator as any, 'getCreateSmartAssetParams')
        .mockResolvedValue({
          smartAssetId: 123,
          initialKeyIsRequestKey: true,
          passphrase: 'be6qhkoijals',
          publicKey: '0xad2b04f0b16C18e2b3cABb301c4B6Df549a161bA',
          tokenRecoveryTimestamp: 123456789,
          uri: '',
        });

      const hydrateTokenSpy = jest.fn();

      const transactionWrapperSpy = jest
        .spyOn(arianeeProtocolClientModule, 'transactionWrapper')
        .mockImplementation();

      await creator.createAndStoreSmartAsset({
        tokenAccess: {
          fromPassphrase: 'be6qhkoijals',
        },
        content: {
          $schema: 'test',
        },
        smartAssetId: 123,
        tokenRecoveryTimestamp: 123456789,
      });

      const { protocolV1Action } = transactionWrapperSpy.mock.calls[0][2];

      await protocolV1Action({
        storeContract: {
          hydrateToken: hydrateTokenSpy,
        },
      } as any);

      expect(hydrateTokenSpy).toHaveBeenCalledWith(
        123,
        '0x0000000000000000000000000000000000000000000000000000000000000111',
        '',
        '0xad2b04f0b16C18e2b3cABb301c4B6Df549a161bA',
        123456789,
        true,
        creatorAddress,
        {}
      );

      expect(transactionWrapperSpy).toHaveBeenCalledWith(
        creator['arianeeProtocolClient'],
        creator['slug'],
        {
          protocolV1Action: expect.any(Function),
        },
        undefined
      );

      expect(requiresCreatorToBeConnectedSpy).toHaveBeenCalled();
      expect(checkCreateSmartAssetParametersSpy).toHaveBeenCalled();
      expect(checkSmartAssetCreditBalanceSpy).toHaveBeenCalled();
      expect(storeSmartAssetSpy).toHaveBeenCalled();
      expect(getCreateSmartAssetParams).toHaveBeenCalledWith({
        tokenAccess: {
          fromPassphrase: 'be6qhkoijals',
        },
        content: {
          $schema: 'test',
        },
        smartAssetId: 123,
        tokenRecoveryTimestamp: 123456789,
      });
    });
  });
  describe('createSmartAsset', () => {
    it('should call the v1 contract with correct params and return the id', async () => {
      const fetchLikeSpy = jest.fn().mockResolvedValue({
        json: () => ({
          $schema: 'test',
        }),
      });
      const creator = new Creator({
        core,
        creatorAddress,
        fetchLike: fetchLikeSpy,
      });

      const requiresCreatorToBeConnectedSpy = jest
        .spyOn(creator.utils, 'requiresCreatorToBeConnected')
        .mockImplementation();

      const checkCreateSmartAssetParametersSpy = jest
        .spyOn(creator as any, 'checkCreateSmartAssetParameters')
        .mockImplementation();

      const checkSmartAssetCreditBalanceSpy = jest
        .spyOn(creator as any, 'checkSmartAssetCreditBalance')
        .mockImplementation();

      const getCreateSmartAssetParams = jest
        .spyOn(creator as any, 'getCreateSmartAssetParams')
        .mockResolvedValue({
          smartAssetId: 123,
          initialKeyIsRequestKey: true,
          passphrase: 'be6qhkoijals',
          publicKey: '0xad2b04f0b16C18e2b3cABb301c4B6Df549a161bA',
          tokenRecoveryTimestamp: 123456789,
          uri: 'https://mock.com/',
        });

      const hydrateTokenSpy = jest.fn();

      const transactionWrapperSpy = jest
        .spyOn(arianeeProtocolClientModule, 'transactionWrapper')
        .mockImplementation();

      await creator.createSmartAsset({
        tokenAccess: {
          fromPassphrase: 'be6qhkoijals',
        },
        uri: 'https://mock.com/',
        smartAssetId: 123,
        tokenRecoveryTimestamp: 123456789,
      });

      const { protocolV1Action } = transactionWrapperSpy.mock.calls[0][2];

      await protocolV1Action({
        storeContract: {
          hydrateToken: hydrateTokenSpy,
        },
      } as any);

      expect(hydrateTokenSpy).toHaveBeenCalledWith(
        123,
        '0x0000000000000000000000000000000000000000000000000000000000000111',
        'https://mock.com/',
        '0xad2b04f0b16C18e2b3cABb301c4B6Df549a161bA',
        123456789,
        true,
        creatorAddress,
        {}
      );

      expect(transactionWrapperSpy).toHaveBeenCalledWith(
        creator['arianeeProtocolClient'],
        creator['slug'],
        {
          protocolV1Action: expect.any(Function),
        },
        undefined
      );

      expect(requiresCreatorToBeConnectedSpy).toHaveBeenCalled();
      expect(checkCreateSmartAssetParametersSpy).toHaveBeenCalled();
      expect(checkSmartAssetCreditBalanceSpy).toHaveBeenCalled();
      expect(getCreateSmartAssetParams).toHaveBeenCalledWith({
        tokenAccess: {
          fromPassphrase: 'be6qhkoijals',
        },
        uri: 'https://mock.com/',
        smartAssetId: 123,
        tokenRecoveryTimestamp: 123456789,
      });
    });
  });
});
