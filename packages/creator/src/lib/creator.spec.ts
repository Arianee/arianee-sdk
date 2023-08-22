import * as arianeeProtocolClientModule from '@arianee/arianee-protocol-client';
import { TokenAccessType } from '@arianee/common-types';
import Core from '@arianee/core';
import { defaultFetchLike } from '@arianee/utils';

import Creator from './creator';
import * as checkCreditsModule from './helpers/checkCredits/checkCredits';
import * as checkCreateMessageParametersModule from './helpers/message/checkCreateMessageParameters';
import * as getCreateMessageParamsModule from './helpers/message/getCreateMessageParams';
import * as checkCreateSmartAssetParametersModule from './helpers/smartAsset/checkCreateSmartAssetParameters';
import * as getCreateSmartAssetParamsModule from './helpers/smartAsset/getCreateSmartAssetParams';
import { CreditType } from './types';

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

    Object.defineProperty(Creator.prototype, 'connected', {
      get: () => true,
    });

    Object.defineProperty(Creator.prototype, 'slug', {
      get: () => 'testnet',
    });

    Object.defineProperty(Creator.prototype, 'protocolDetails', {
      get: () => ({}),
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
        .spyOn(creator.utils as any, 'getSmartAssetIssuer')
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
    it('should call createSmartAssetCommon with correct params', async () => {
      const createSmartAssetCommonSpy = jest
        .spyOn(creator as any, 'createSmartAssetCommon')
        .mockImplementation();

      const params = {
        tokenAccess: {
          fromPassphrase: 'be6qhkoijals',
        },
        content: {
          $schema: 'test',
        },
        smartAssetId: 123,
        tokenRecoveryTimestamp: 123456789,
      };

      await creator.createAndStoreSmartAsset(params);

      expect(createSmartAssetCommonSpy).toHaveBeenCalledWith(
        params,
        expect.any(Function),
        {}
      );
    });
  });

  describe('createSmartAsset', () => {
    it('should call createSmartAssetCommon with fetched content', async () => {
      const params = {
        tokenAccess: {
          fromPassphrase: 'be6qhkoijals',
        },
        uri: 'https://mock.com',
        smartAssetId: 123,
        tokenRecoveryTimestamp: 123456789,
      };

      const content = {
        $schema: 'test',
      };

      const fetchLikeSpy = jest.fn().mockResolvedValue({
        ok: true,
        json: () => content,
      });

      const creator = new Creator({
        core,
        creatorAddress,
        fetchLike: fetchLikeSpy,
      });

      const createSmartAssetCommonSpy = jest
        .spyOn(creator as any, 'createSmartAssetCommon')
        .mockImplementation();

      await creator.createSmartAsset(params);

      expect(createSmartAssetCommonSpy).toHaveBeenCalledWith(
        {
          ...params,
          content,
        },
        null,
        {}
      );
    });
  });

  describe('createSmartAssetCommon', () => {
    it('should call the v1 contract with correct params and return the id', async () => {
      const content = {
        $schema: 'test',
      };

      const calculateImprintSpy = jest
        .spyOn(creator.utils, 'calculateImprint')
        .mockResolvedValue(
          '0x0000000000000000000000000000000000000000000000000000000000000111'
        );

      const checkCreateSmartAssetParametersSpy = jest
        .spyOn(
          checkCreateSmartAssetParametersModule as any,
          'checkCreateSmartAssetParameters'
        )
        .mockImplementation();

      const checkCreditsBalanceSpy = jest
        .spyOn(checkCreditsModule, 'checkCreditsBalance')
        .mockImplementation();

      const getCreateSmartAssetParams = jest
        .spyOn(
          getCreateSmartAssetParamsModule as any,
          'getCreateSmartAssetParams'
        )
        .mockResolvedValue({
          smartAssetId: 123,
          initialKeyIsRequestKey: true,
          passphrase: 'be6qhkoijals',
          publicKey: '0xad2b04f0b16C18e2b3cABb301c4B6Df549a161bA',
          tokenRecoveryTimestamp: 123456789,
          content: content,
          uri: '',
        });

      const hydrateTokenSpy = jest.fn();

      const transactionWrapperSpy = jest
        .spyOn(arianeeProtocolClientModule, 'transactionWrapper')
        .mockImplementation();

      const afterTransactionSpy = jest.fn();

      await creator['createSmartAssetCommon'](
        {
          tokenAccess: {
            fromPassphrase: 'be6qhkoijals',
          },
          content,
          smartAssetId: 123,
          tokenRecoveryTimestamp: 123456789,
        },
        afterTransactionSpy
      );

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

      expect(checkCreateSmartAssetParametersSpy).toHaveBeenCalled();
      expect(checkCreditsBalanceSpy).toHaveBeenCalledWith(
        creator['utils'],
        CreditType.smartAsset,
        BigInt(1)
      );
      expect(getCreateSmartAssetParams).toHaveBeenCalledWith(creator['utils'], {
        tokenAccess: {
          fromPassphrase: 'be6qhkoijals',
        },
        content,
        smartAssetId: 123,
        tokenRecoveryTimestamp: 123456789,
      });

      expect(calculateImprintSpy).toHaveBeenCalledWith(content);

      expect(afterTransactionSpy).toHaveBeenCalledWith(123);
    });
  });

  describe('setTokenAccess', () => {
    it('should call the v1 contract with correct params and return the id', async () => {
      const getSmartAssetOwnerSpy = jest
        .spyOn(creator.utils, 'getSmartAssetOwner')
        .mockResolvedValue(core.getAddress());

      const addTokenAccessSpy = jest.fn();

      const transactionWrapperSpy = jest
        .spyOn(arianeeProtocolClientModule, 'transactionWrapper')
        .mockImplementation();

      await creator.setTokenAccess('123', TokenAccessType.request, {
        fromPassphrase: 'be6qhkoijals',
      });

      const { protocolV1Action } = transactionWrapperSpy.mock.calls[0][2];

      await protocolV1Action({
        smartAssetContract: {
          addTokenAccess: addTokenAccessSpy,
        },
      } as any);

      expect(addTokenAccessSpy).toHaveBeenCalledWith(
        '123',
        '0xad2b04f0b16C18e2b3cABb301c4B6Df549a161bA',
        true,
        TokenAccessType.request,
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

      expect(getSmartAssetOwnerSpy).toHaveBeenCalledWith('123');
    });
  });

  describe('setRequestKey', () => {
    it('should call setTokenAccess with correct params', async () => {
      const setTokenAccessSpy = jest
        .spyOn(creator, 'setTokenAccess')
        .mockImplementation();

      await creator.setRequestKey('123', {
        fromPassphrase: 'be6qhkoijals',
      });

      expect(setTokenAccessSpy).toHaveBeenCalledWith(
        '123',
        TokenAccessType.request,
        {
          fromPassphrase: 'be6qhkoijals',
        },
        {}
      );
    });
  });

  describe('createAndStoreMessage', () => {
    it('should call createMessageCommon with the correct params', async () => {
      const params = {
        content: {
          $schema: 'test',
        },
        smartAssetId: 123,
        messageId: 456,
      };

      const createMessageCommonSpy = jest
        .spyOn(creator as any, 'createMessageCommon')
        .mockImplementation();

      await creator.createAndStoreMessage(params);

      expect(createMessageCommonSpy).toHaveBeenCalledWith(
        params,
        expect.any(Function),
        {}
      );
    });
  });

  describe('createMessage', () => {
    it('should call createMessageCommon with the fetched content', async () => {
      const params = {
        uri: 'https://mock.com',
        smartAssetId: 123,
        messageId: 456,
      };

      const content = {
        $schema: 'test',
      };

      const fetchLikeSpy = jest.fn().mockResolvedValue({
        ok: true,
        json: () => content,
      });

      const creator = new Creator({
        core,
        creatorAddress,
        fetchLike: fetchLikeSpy,
      });

      const createMessageCommonSpy = jest
        .spyOn(creator as any, 'createMessageCommon')
        .mockImplementation();

      await creator.createMessage(params);

      expect(createMessageCommonSpy).toHaveBeenCalledWith(
        {
          ...params,
          content,
        },
        null,
        {}
      );
    });
  });

  describe('createMessageCommon', () => {
    it('should call the v1 contract with correct params and return the id and imprint', async () => {
      const content = {
        $schema: 'test',
      };

      const getCreateMessageParamsSpy = jest
        .spyOn(getCreateMessageParamsModule as any, 'getCreateMessageParams')
        .mockResolvedValue({
          smartAssetId: 123,
          messageId: 456,
          content,
        });

      const checkCreateMessageParametersSpy = jest
        .spyOn(
          checkCreateMessageParametersModule as any,
          'checkCreateMessageParameters'
        )
        .mockImplementation();

      const checkCreditsBalanceSpy = jest
        .spyOn(checkCreditsModule, 'checkCreditsBalance')
        .mockImplementation();

      const calculateImprintSpy = jest
        .spyOn(creator.utils, 'calculateImprint')
        .mockResolvedValue(
          '0x0000000000000000000000000000000000000000000000000000000000000111'
        );

      const afterTransactionSpy = jest.fn();

      const createMessageSpy = jest.fn();

      const transactionWrapperSpy = jest
        .spyOn(arianeeProtocolClientModule, 'transactionWrapper')
        .mockImplementation(async (_, __, actions) => {
          await actions.protocolV1Action({
            storeContract: {
              createMessage: createMessageSpy,
            },
          } as any);

          return null as any;
        });

      await creator['createMessageCommon'](
        {
          content,
          smartAssetId: 123,
          messageId: 456,
        },
        afterTransactionSpy
      );

      expect(createMessageSpy).toHaveBeenCalledWith(
        456,
        123,
        '0x0000000000000000000000000000000000000000000000000000000000000111',
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

      expect(checkCreateMessageParametersSpy).toHaveBeenCalled();
      expect(checkCreditsBalanceSpy).toHaveBeenCalledWith(
        creator['utils'],
        CreditType.message,
        BigInt(1)
      );
      expect(getCreateMessageParamsSpy).toHaveBeenCalledWith(creator['utils'], {
        content,
        smartAssetId: 123,
        messageId: 456,
      });

      expect(calculateImprintSpy).toHaveBeenCalledWith(content);
      expect(afterTransactionSpy).toHaveBeenCalledWith(456);
    });
  });
});
