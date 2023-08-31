import * as arianeeProtocolClientModule from '@arianee/arianee-protocol-client';
import * as getCreatorIdentityModule from '../helpers/identity/getCreatorIdentity';
import * as getContentFromURIModule from '../helpers/uri/getContentFromURI';
import * as getCreateSmartAssetParamsModule from '../helpers/smartAsset/getCreateSmartAssetParams';
import * as checkCreateSmartAssetParametersModule from '../helpers/smartAsset/checkCreateSmartAssetParameters';
import * as assertSmartAssetIssuedByModule from '../helpers/smartAsset/assertSmartAssetIssuedBy';
import * as checkCreditsModule from '../helpers/checkCredits/checkCredits';

import Core from '@arianee/core';
import { ArianeePrivacyGatewayClient } from '@arianee/arianee-privacy-gateway-client';
import { ArianeePrivacyGatewayError } from '../errors';

import Creator from '../creator';
import { CreditType } from '../types';
import { TokenAccessType } from '@arianee/common-types';
jest.mock('@arianee/arianee-protocol-client');
jest.mock('@arianee/arianee-privacy-gateway-client');
jest.spyOn(console, 'error').mockImplementation();

describe('SmartAssets', () => {
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

    jest.clearAllMocks();
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

      await creator.smartAssets.reserveSmartAssetId(123);

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

      await creator.smartAssets.destroySmartAsset('123');

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

      await creator.smartAssets.recoverSmartAsset('123');

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
      jest
        .spyOn(getCreatorIdentityModule, 'getCreatorIdentity')
        .mockImplementation();

      const createSmartAssetCommonSpy = jest
        .spyOn(creator.smartAssets as any, 'createSmartAssetCommon')
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

      await creator.smartAssets.createAndStoreSmartAsset(params);

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

      jest
        .spyOn(getContentFromURIModule, 'getContentFromURI')
        .mockResolvedValue(content);

      const createSmartAssetCommonSpy = jest
        .spyOn(creator.smartAssets as any, 'createSmartAssetCommon')
        .mockImplementation();

      await creator.smartAssets.createSmartAsset(params);

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

      await creator.smartAssets['createSmartAssetCommon'](
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

      await creator.smartAssets.setTokenAccess('123', TokenAccessType.request, {
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
        .spyOn(creator.smartAssets, 'setTokenAccess')
        .mockImplementation();

      await creator.smartAssets.setRequestKey('123', {
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

  describe('updateSmartAssetContent', () => {
    it('should throw an ArianeePrivacyGatewayError if the rpc call fails', async () => {
      jest
        .spyOn(ArianeePrivacyGatewayClient.prototype, 'updateCreate')
        .mockRejectedValue('error');

      jest
        .spyOn(getCreatorIdentityModule, 'getCreatorIdentity')
        .mockImplementation();

      expect(
        creator.smartAssets['updateSmartAssetContent'](123, { $schema: 'mock' })
      ).rejects.toThrow(/Arianee Privacy Gateway/gi);
      expect(
        creator.smartAssets['updateSmartAssetContent'](123, { $schema: 'mock' })
      ).rejects.toThrowError(ArianeePrivacyGatewayError);
    });

    it('should call updateCreate', async () => {
      const spy = jest
        .spyOn(ArianeePrivacyGatewayClient.prototype, 'updateCreate')
        .mockImplementation();

      jest
        .spyOn(getCreatorIdentityModule, 'getCreatorIdentity')
        .mockImplementation(
          () =>
            ({
              rpcEndpoint: 'https://mock.com',
            } as any)
        );

      await creator.smartAssets['updateSmartAssetContent'](123, {
        $schema: 'mock',
      });

      expect(spy).toHaveBeenCalledWith('https://mock.com', {
        certificateId: '123',
        content: { $schema: 'mock' },
      });
    });
  });

  describe('updateSmartAsset', () => {
    it('should call make an update transaction and call updateSmartAssetContent', async () => {
      const content = {
        $schema: 'mock',
      };
      const assertSmartAssetIssuedBySpy = jest
        .spyOn(assertSmartAssetIssuedByModule, 'assertSmartAssetIssuedBy')
        .mockImplementation();

      const getCreatorIdentitySpy = jest
        .spyOn(getCreatorIdentityModule, 'getCreatorIdentity')
        .mockImplementation();

      const checkCreditsBalanceSpy = jest
        .spyOn(checkCreditsModule, 'checkCreditsBalance')
        .mockImplementation();

      const calculateImprintSpy = jest
        .spyOn(creator.utils, 'calculateImprint')
        .mockResolvedValue('0xmock');

      const updateSmartAssetContentSpy = jest
        .spyOn(creator.smartAssets as any, 'updateSmartAssetContent')
        .mockImplementation();

      const updateSmartAssetSpy = jest.fn();

      const transactionWrapperSpy = jest
        .spyOn(arianeeProtocolClientModule, 'transactionWrapper')
        .mockImplementation(async (_, __, actions) => {
          await actions.protocolV1Action({
            storeContract: {
              updateSmartAsset: updateSmartAssetSpy,
            },
          } as any);

          return null as any;
        });

      const { imprint } = await creator.smartAssets.updateSmartAsset(
        '123',
        content
      );

      expect(imprint).toEqual('0xmock');
      expect(assertSmartAssetIssuedBySpy).toHaveBeenCalledWith(
        {
          smartAssetId: '123',
          expectedIssuer: core.getAddress(),
        },
        creator.utils
      );
      expect(getCreatorIdentitySpy).toHaveBeenCalledWith(creator);
      expect(checkCreditsBalanceSpy).toHaveBeenCalledWith(
        creator.utils,
        CreditType.update,
        BigInt(1)
      );
      expect(calculateImprintSpy).toHaveBeenCalledWith(content);
      expect(updateSmartAssetContentSpy).toBeCalledWith(123, content);
      expect(updateSmartAssetSpy).toHaveBeenCalledWith(
        '123',
        '0xmock',
        creatorAddress,
        {}
      );
    });
  });

  describe('updateTokenURI', () => {
    it('should call the v1 contract with correct params and return the id and imprint', async () => {
      const updateTokenURISpy = jest.fn();

      const assertSmartAssetIssuedBySpy = jest
        .spyOn(assertSmartAssetIssuedByModule, 'assertSmartAssetIssuedBy')
        .mockImplementation();

      const getContentFromURISpy = jest
        .spyOn(getContentFromURIModule, 'getContentFromURI')
        .mockImplementation();

      const transactionWrapperSpy = jest
        .spyOn(arianeeProtocolClientModule, 'transactionWrapper')
        .mockImplementation(async (_, __, actions) => {
          await actions.protocolV1Action({
            smartAssetContract: {
              updateTokenURI: updateTokenURISpy,
            },
          } as any);

          return null as any;
        });

      await creator.smartAssets.updateTokenURI('123', 'https://mock.com');

      expect(updateTokenURISpy).toHaveBeenCalledWith(
        '123',
        'https://mock.com',
        {}
      );

      expect(assertSmartAssetIssuedBySpy).toHaveBeenCalledWith(
        {
          smartAssetId: '123',
          expectedIssuer: core.getAddress(),
        },
        creator.utils
      );

      expect(transactionWrapperSpy).toHaveBeenCalledWith(
        creator['arianeeProtocolClient'],
        creator['slug'],
        {
          protocolV1Action: expect.any(Function),
        },
        undefined
      );

      expect(getContentFromURISpy).toHaveBeenCalled();
      // expect(getSmartAssetIssuerSpy).toHaveBeenCalledWith('123');
    });
  });

  describe('storeSmartAsset', () => {
    it('should throw an ArianeePrivacyGatewayError if the rpc call fails', async () => {
      jest
        .spyOn(ArianeePrivacyGatewayClient.prototype, 'certificateCreate')
        .mockRejectedValue('error');

      jest
        .spyOn(getCreatorIdentityModule, 'getCreatorIdentity')
        .mockImplementation();

      expect(
        creator.smartAssets['storeSmartAsset'](123, { $schema: 'mock' })
      ).rejects.toThrow(/Arianee Privacy Gateway/gi);
      expect(
        creator.smartAssets['storeSmartAsset'](123, { $schema: 'mock' })
      ).rejects.toThrowError(ArianeePrivacyGatewayError);
    });

    it('should call certificateCreate', async () => {
      const spy = jest
        .spyOn(ArianeePrivacyGatewayClient.prototype, 'certificateCreate')
        .mockImplementation();

      jest
        .spyOn(getCreatorIdentityModule, 'getCreatorIdentity')
        .mockImplementation(
          () =>
            ({
              rpcEndpoint: 'https://mock.com',
            } as any)
        );

      await creator.smartAssets['storeSmartAsset'](123, { $schema: 'mock' });

      expect(spy).toHaveBeenCalledWith('https://mock.com', {
        certificateId: '123',
        content: { $schema: 'mock' },
      });
    });
  });
});
