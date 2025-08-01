import { ArianeePrivacyGatewayClient } from '@arianee/arianee-privacy-gateway-client';
import * as arianeeProtocolClientModule from '@arianee/arianee-protocol-client';
import { ProtocolDetailsV1 } from '@arianee/common-types';
import Core from '@arianee/core';
import { getIssuerSigTemplate__Event } from '@arianee/utils';
import { ethers } from 'ethers';

import Creator from '../creator';
import { ArianeePrivacyGatewayError } from '../errors';
import * as checkCreditsModule from '../helpers/checkCredits/checkCredits';
import * as checkCreateEventParametersModule from '../helpers/event/checkCreateEventParameters';
import * as getCreateEventParamsModule from '../helpers/event/getCreateEventParams';
import * as getIdentityModule from '../helpers/identity/getIdentity';
import * as getOwnershipProofStructModule from '../helpers/privacy/getOwnershipProofStruct';
import * as getContentFromURIModule from '../helpers/uri/getContentFromURI';
import { CreditType } from '../types';

jest.mock('@arianee/arianee-protocol-client');
jest.mock('@arianee/arianee-privacy-gateway-client');
jest.spyOn(console, 'error').mockImplementation();

describe('Events', () => {
  const core = Core.fromRandom();
  const creatorAddress = `0x${'a'.repeat(40)}`;
  let creator: Creator<'WAIT_TRANSACTION_RECEIPT'>;

  const mockProtocolDetails: Partial<
    Omit<ProtocolDetailsV1, 'contractAdresses'> & {
      contractAdresses: { smartAsset: string };
    }
  > = {
    protocolVersion: '1.0',
    chainId: 77,
    contractAdresses: {
      smartAsset: '0x512C1FCF401133680f373a386F3f752b98070BC5',
    },
  };

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

  describe('createAndStoreEvent', () => {
    it('should call createEventCommon with the correct params', async () => {
      jest.spyOn(getIdentityModule, 'getCreatorIdentity').mockImplementation();

      const params = {
        content: {
          $schema: 'test',
        },
        smartAssetId: 123,
        eventId: 456,
      };

      const createEventCommonSpy = jest
        .spyOn(creator.events as any, 'createEventCommon')
        .mockImplementation();

      await creator.events.createAndStoreEvent(params);

      expect(createEventCommonSpy).toHaveBeenCalledWith(
        params,
        expect.any(Function),
        {}
      );
    });
  });

  describe('createEvent', () => {
    it('should call createEventCommon with the fetched content', async () => {
      const params = {
        uri: 'https://mock.com',
        smartAssetId: 123,
        eventId: 456,
      };

      const content = {
        $schema: 'test',
      };

      jest
        .spyOn(getContentFromURIModule, 'getContentFromURI')
        .mockResolvedValue(content);

      const createEventCommonSpy = jest
        .spyOn(creator.events as any, 'createEventCommon')
        .mockImplementation();

      await creator.events.createEvent(params);

      expect(createEventCommonSpy).toHaveBeenCalledWith(
        {
          ...params,
          content,
        },
        null,
        {}
      );
    });
  });

  describe('createEventCommon', () => {
    it('should call the v1 contract with correct params and return the id, imprint and content', async () => {
      const content = {
        $schema: 'test',
      };

      const getCreateEventParamsSpy = jest
        .spyOn(getCreateEventParamsModule as any, 'getCreateEventParams')
        .mockResolvedValue({
          smartAssetId: 123,
          eventId: 456,
          content,
          uri: '',
        });

      const checkCreateEventParametersSpy = jest
        .spyOn(
          checkCreateEventParametersModule as any,
          'checkCreateEventParameters'
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

      const createEventSpy = jest.fn();

      const transactionWrapperSpy = jest
        .spyOn(arianeeProtocolClientModule, 'transactionWrapper')
        .mockImplementation(async (_, __, actions) => {
          await actions.protocolV1Action({
            storeContract: {
              createEvent: createEventSpy,
            },
          } as any);

          return null as any;
        });

      await creator.events['createEventCommon'](
        {
          content,
          smartAssetId: 123,
          eventId: 456,
        },
        afterTransactionSpy
      );

      expect(createEventSpy).toHaveBeenCalledWith(
        456,
        123,
        '0x0000000000000000000000000000000000000000000000000000000000000111',
        '',
        creatorAddress,
        {}
      );

      expect(transactionWrapperSpy).toHaveBeenCalledWith(
        creator['arianeeProtocolClient'],
        creator['slug'],
        {
          protocolV1Action: expect.any(Function),
          protocolV2Action: expect.any(Function),
        },
        undefined
      );

      expect(checkCreateEventParametersSpy).toHaveBeenCalled();
      expect(checkCreditsBalanceSpy).toHaveBeenCalledWith(
        creator['utils'],
        CreditType.event,
        BigInt(1)
      );
      expect(getCreateEventParamsSpy).toHaveBeenCalledWith(creator['utils'], {
        content,
        smartAssetId: 123,
        eventId: 456,
      });

      expect(calculateImprintSpy).toHaveBeenCalledWith(content);
      expect(afterTransactionSpy).toHaveBeenCalledWith(123, 456, content);
    });
    it('should call the v2 contract with correct params and return the id, imprint and content', async () => {
      const content = {
        $schema: 'test',
      };

      const getCreateEventParamsSpy = jest
        .spyOn(getCreateEventParamsModule as any, 'getCreateEventParams')
        .mockResolvedValue({
          smartAssetId: 123,
          eventId: 456,
          content,
          uri: '',
        });

      const checkCreateEventParametersSpy = jest
        .spyOn(
          checkCreateEventParametersModule as any,
          'checkCreateEventParameters'
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

      const createEventSpy = jest.fn();

      const transactionWrapperSpy = jest
        .spyOn(arianeeProtocolClientModule, 'transactionWrapper')
        .mockImplementation(async (_, __, actions) => {
          await actions.protocolV2Action({
            eventHubContract: {
              createEvent: createEventSpy,
            },
            protocolDetails: {
              contractAdresses: {
                nft: '0x0000',
              },
            },
          } as any);

          return null as any;
        });

      await creator.events['createEventCommon'](
        {
          content,
          smartAssetId: 123,
          eventId: 456,
        },
        afterTransactionSpy
      );

      expect(createEventSpy).toHaveBeenCalledWith(
        '0x0000',
        456,
        123,
        '0x0000000000000000000000000000000000000000000000000000000000000111',
        '',
        creatorAddress
      );

      expect(transactionWrapperSpy).toHaveBeenCalledWith(
        creator['arianeeProtocolClient'],
        creator['slug'],
        {
          protocolV1Action: expect.any(Function),
          protocolV2Action: expect.any(Function),
        },
        undefined
      );

      expect(checkCreateEventParametersSpy).toHaveBeenCalled();
      expect(checkCreditsBalanceSpy).toHaveBeenCalledWith(
        creator['utils'],
        CreditType.event,
        BigInt(1),
        undefined
      );
      expect(getCreateEventParamsSpy).toHaveBeenCalledWith(creator['utils'], {
        content,
        smartAssetId: 123,
        eventId: 456,
      });

      expect(calculateImprintSpy).toHaveBeenCalledWith(content);
      expect(afterTransactionSpy).toHaveBeenCalledWith(123, 456, content);
    });
    it('should inject a valid `issuerSignature` in content and return the id, imprint and modified content if privacyMode is enabled', async () => {
      jest.spyOn(creator, 'privacyMode', 'get').mockReturnValue(true);

      const content = {
        $schema: 'test',
      };

      const getCreateEventParamsSpy = jest
        .spyOn(getCreateEventParamsModule as any, 'getCreateEventParams')
        .mockResolvedValue({
          smartAssetId: 123,
          eventId: 456,
          content,
          uri: '',
        });

      jest
        .spyOn(
          checkCreateEventParametersModule as any,
          'checkCreateEventParameters'
        )
        .mockImplementation();

      jest
        .spyOn(checkCreditsModule, 'checkCreditsBalance')
        .mockImplementation();

      jest
        .spyOn(creator.utils, 'calculateImprint')
        .mockResolvedValue(
          '0x0000000000000000000000000000000000000000000000000000000000000111'
        );

      const afterTransactionSpy = jest.fn();

      jest
        .spyOn(arianeeProtocolClientModule, 'transactionWrapper')
        .mockImplementation(async (_, __, actions) => {
          await actions.protocolV1Action({
            arianeeIssuerProxy: {
              createEvent: jest.fn(),
            },
          } as any);

          return null as any;
        });

      jest
        .spyOn(creator, 'connectedProtocolClient', 'get')
        .mockReturnValue({ protocolDetails: mockProtocolDetails } as any);

      jest.spyOn(creator, 'prover', 'get').mockReturnValue({
        issuerProxy: {
          computeIntentHash: jest
            .fn()
            .mockResolvedValue({ intentHashAsStr: 'mock' }),
          generateProof: jest.fn().mockResolvedValue({ callData: 'mock' }),
        },
      } as any);

      jest
        .spyOn(getOwnershipProofStructModule, 'getOwnershipProofStruct')
        .mockImplementation();

      await creator.events['createEventCommon'](
        {
          content,
          smartAssetId: 123,
          eventId: 456,
        },
        afterTransactionSpy
      );

      expect(getCreateEventParamsSpy).toHaveBeenCalledWith(creator['utils'], {
        content,
        smartAssetId: 123,
        eventId: 456,
      });

      const expectedIssuerSignature = await core.signMessage(
        getIssuerSigTemplate__Event(
          mockProtocolDetails as ProtocolDetailsV1,
          456
        )
      );

      expect(afterTransactionSpy).toHaveBeenCalledWith(123, 456, {
        ...content,
        issuerSignature: expectedIssuerSignature.signature,
      });
    });
  });

  describe('storeEvent', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
    it('should throw an ArianeePrivacyGatewayError if the rpc call fails', async () => {
      jest
        .spyOn(ArianeePrivacyGatewayClient.prototype, 'eventCreate')
        .mockRejectedValue('error');

      jest.spyOn(getIdentityModule, 'getCreatorIdentity').mockImplementation();

      // Mock callWrapper pour retourner creatorAddress comme issuer
      jest
        .spyOn(arianeeProtocolClientModule, 'callWrapper')
        .mockImplementation(async (_, __, actions) =>
          actions.protocolV1Action({
            smartAssetContract: {
              issuerOf: jest.fn().mockResolvedValue(creatorAddress),
            },
          } as any)
        );

      await expect(
        creator.events['storeEvent'](1, 123, { $schema: 'mock' }, false)
      ).rejects.toThrowError(ArianeePrivacyGatewayError);
    });

    it("should call eventCreate and store it in the creator's identity privacy gateway", async () => {
      const spy = jest
        .spyOn(ArianeePrivacyGatewayClient.prototype, 'eventCreate')
        .mockImplementation();

      jest.spyOn(getIdentityModule, 'getCreatorIdentity').mockImplementation(
        () =>
          ({
            rpcEndpoint: 'https://mock.com',
          } as any)
      );

      // Mock callWrapper pour retourner creatorAddress comme issuer
      jest
        .spyOn(arianeeProtocolClientModule, 'callWrapper')
        .mockImplementation(async (_, __, actions) =>
          actions.protocolV1Action({
            smartAssetContract: {
              issuerOf: jest.fn().mockResolvedValue(creatorAddress),
            },
          } as any)
        );

      await creator.events['storeEvent'](1, 123, { $schema: 'mock' }, false);

      expect(spy).toHaveBeenCalledWith('https://mock.com', {
        eventId: '123',
        content: { $schema: 'mock' },
      });
    });

    it("should call eventCreate and store it in the smart asset issuer's identity privacy gateway", async () => {
      const spy = jest
        .spyOn(ArianeePrivacyGatewayClient.prototype, 'eventCreate')
        .mockImplementation();

      const getIdentitySpy = jest
        .spyOn(getIdentityModule, 'getIdentity')
        .mockImplementation(
          () =>
            ({
              rpcEndpoint: 'https://mock.com',
            } as any)
        );

      // Mock callWrapper pour retourner une adresse différente du creator
      const issuerOfSpy = jest.fn().mockResolvedValueOnce('0x123');
      jest
        .spyOn(arianeeProtocolClientModule, 'callWrapper')
        .mockImplementation(async (_, __, actions) =>
          actions.protocolV1Action({
            smartAssetContract: {
              issuerOf: issuerOfSpy,
            },
          } as any)
        );

      await creator.events['storeEvent'](1, 123, { $schema: 'mock' }, true);

      expect(spy).toHaveBeenCalledWith('https://mock.com', {
        eventId: '123',
        content: { $schema: 'mock' },
      });
      expect(getIdentitySpy).toHaveBeenCalledWith(creator, '0x123');
      expect(issuerOfSpy).toHaveBeenCalled();
    });

    it("should call eventCreate and store it in the smart asset owner's identity privacy gateway if the issuer is the zero address (reserved nft case)", async () => {
      // Spy sur eventCreate
      const spy = jest
        .spyOn(ArianeePrivacyGatewayClient.prototype, 'eventCreate')
        .mockImplementation();

      // Spy sur getIdentity
      const getIdentitySpy = jest
        .spyOn(getIdentityModule, 'getIdentity')
        .mockImplementation(() => ({ rpcEndpoint: 'https://mock.com' } as any));

      // Prépare trois spies pour issuerOf / ownerOf
      const issuerOfSpy1 = jest.fn().mockResolvedValueOnce(ethers.ZeroAddress); // outer
      const issuerOfSpy2 = jest.fn().mockResolvedValueOnce(ethers.ZeroAddress); // inner
      const ownerOfSpy = jest.fn().mockResolvedValueOnce('0x123'); // fallback

      const callWrapperSpy = jest.spyOn(
        arianeeProtocolClientModule,
        'callWrapper'
      );

      // 1er appel → outer smartAssetIssuer
      callWrapperSpy.mockImplementationOnce(async (_, __, actions) =>
        actions.protocolV1Action({
          smartAssetContract: { issuerOf: issuerOfSpy1, ownerOf: jest.fn() },
        } as any)
      );

      // 2ᵉ appel → inner issuerOf (déclenche le fallback interne)
      callWrapperSpy.mockImplementationOnce(async (_, __, actions) =>
        actions.protocolV1Action({
          smartAssetContract: { issuerOf: issuerOfSpy2, ownerOf: jest.fn() },
        } as any)
      );

      // 3ᵉ appel → inner ownerOf (fournit enfin l'owner réel)
      callWrapperSpy.mockImplementationOnce(async (_, __, actions) =>
        actions.protocolV1Action({
          smartAssetContract: { issuerOf: jest.fn(), ownerOf: ownerOfSpy },
        } as any)
      );

      // Exécution du test
      await creator.events['storeEvent'](1, 123, { $schema: 'mock' }, true);

      // Assertions
      expect(issuerOfSpy1).toHaveBeenCalled(); // Outer
      expect(issuerOfSpy2).toHaveBeenCalled(); // Inner issuer
      expect(ownerOfSpy).toHaveBeenCalled(); // Fallback owner

      expect(getIdentitySpy).toHaveBeenCalledWith(creator, '0x123');
      expect(spy).toHaveBeenCalledWith('https://mock.com', {
        eventId: '123',
        content: { $schema: 'mock' },
      });

      expect(callWrapperSpy).toHaveBeenCalledTimes(3);
    });

    it('should store event in both smart asset issuer and event issuer privacy gateways when issuers are different', async () => {
      const spy = jest
        .spyOn(ArianeePrivacyGatewayClient.prototype, 'eventCreate')
        .mockImplementation();

      const getIdentitySpy = jest
        .spyOn(getIdentityModule, 'getIdentity')
        .mockImplementation(
          () =>
            ({
              rpcEndpoint: 'https://smart-asset-issuer.com',
            } as any)
        );

      const getCreatorIdentitySpy = jest
        .spyOn(getIdentityModule, 'getCreatorIdentity')
        .mockImplementation(
          () =>
            ({
              rpcEndpoint: 'https://event-issuer.com',
            } as any)
        );

      // Mock callWrapper pour retourner une adresse différente du creator
      const issuerOfSpy = jest.fn().mockResolvedValueOnce('0x456');
      jest
        .spyOn(arianeeProtocolClientModule, 'callWrapper')
        .mockImplementation(async (_, __, actions) =>
          actions.protocolV1Action({
            smartAssetContract: {
              issuerOf: issuerOfSpy,
            },
          } as any)
        );

      await creator.events['storeEvent'](1, 123, { $schema: 'mock' }, true);

      expect(spy).toHaveBeenCalledTimes(2);
      expect(spy).toHaveBeenNthCalledWith(1, 'https://smart-asset-issuer.com', {
        eventId: '123',
        content: { $schema: 'mock' },
      });
      expect(spy).toHaveBeenNthCalledWith(2, 'https://event-issuer.com', {
        eventId: '123',
        content: { $schema: 'mock' },
      });
      expect(getIdentitySpy).toHaveBeenCalledWith(creator, '0x456');
      expect(getCreatorIdentitySpy).toHaveBeenCalled();
      expect(issuerOfSpy).toHaveBeenCalled();
    });

    it('should store event in single gateway when issuers are the same', async () => {
      // Spy sur eventCreate
      const spy = jest
        .spyOn(ArianeePrivacyGatewayClient.prototype, 'eventCreate')
        .mockImplementation();

      // Forcer eventIssuer === creatorAddress via getCreatorIdentity
      const getCreatorIdentitySpy = jest
        .spyOn(getIdentityModule, 'getCreatorIdentity')
        .mockImplementation(
          () =>
            ({
              rpcEndpoint: 'https://mock.com',
            } as any)
        );

      // Mock callWrapper pour retourner creatorAddress comme smartAssetIssuer
      const issuerOfSpy = jest.fn().mockResolvedValueOnce(creatorAddress);
      jest
        .spyOn(arianeeProtocolClientModule, 'callWrapper')
        .mockImplementation(async (_, __, actions) =>
          actions.protocolV1Action({
            smartAssetContract: {
              issuerOf: issuerOfSpy,
            },
          } as any)
        );

      // Exécuter avec useSmartAssetIssuerPrivacyGateway = false
      await creator.events['storeEvent'](1, 123, { $schema: 'mock' }, false);

      // Assertions
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith('https://mock.com', {
        eventId: '123',
        content: { $schema: 'mock' },
      });

      expect(getCreatorIdentitySpy).toHaveBeenCalledWith(creator);
      expect(issuerOfSpy).toHaveBeenCalled();
    });

    it('should store event in single gateway when useSmartAssetIssuerPrivacyGateway is false', async () => {
      const spy = jest
        .spyOn(ArianeePrivacyGatewayClient.prototype, 'eventCreate')
        .mockImplementation();

      const getCreatorIdentitySpy = jest
        .spyOn(getIdentityModule, 'getCreatorIdentity')
        .mockImplementation(
          () =>
            ({
              rpcEndpoint: 'https://event-issuer.com',
            } as any)
        );

      // Mock callWrapper pour retourner creatorAddress comme issuer
      jest
        .spyOn(arianeeProtocolClientModule, 'callWrapper')
        .mockImplementation(async (_, __, actions) =>
          actions.protocolV1Action({
            smartAssetContract: {
              issuerOf: jest.fn().mockResolvedValue(creatorAddress),
            },
          } as any)
        );

      await creator.events['storeEvent'](1, 123, { $schema: 'mock' }, false);

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith('https://event-issuer.com', {
        eventId: '123',
        content: { $schema: 'mock' },
      });
      expect(getCreatorIdentitySpy).toHaveBeenCalled();
    });
  });
});
