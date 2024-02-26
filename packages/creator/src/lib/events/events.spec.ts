import { ArianeePrivacyGatewayClient } from '@arianee/arianee-privacy-gateway-client';
import * as arianeeProtocolClientModule from '@arianee/arianee-protocol-client';
import Core from '@arianee/core';
import { ethers } from 'ethers';

import Creator from '../creator';
import { ArianeePrivacyGatewayError } from '../errors';
import * as checkCreditsModule from '../helpers/checkCredits/checkCredits';
import * as checkCreateEventParametersModule from '../helpers/event/checkCreateEventParameters';
import * as getCreateEventParamsModule from '../helpers/event/getCreateEventParams';
import * as getIdentityModule from '../helpers/identity/getIdentity';
import * as getContentFromURIModule from '../helpers/uri/getContentFromURI';
import { CreditType } from '../types';

jest.mock('@arianee/arianee-protocol-client');
jest.mock('@arianee/arianee-privacy-gateway-client');
jest.spyOn(console, 'error').mockImplementation();

describe('Events', () => {
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
    it('should call the v1 contract with correct params and return the id and imprint', async () => {
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
      expect(afterTransactionSpy).toHaveBeenCalledWith(123, 456);
    });
    it('should call the v2 contract with correct params and return the id and imprint', async () => {
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
      expect(afterTransactionSpy).toHaveBeenCalledWith(123, 456);
    });
  });

  describe('storeEvent', () => {
    it('should throw an ArianeePrivacyGatewayError if the rpc call fails', async () => {
      jest
        .spyOn(ArianeePrivacyGatewayClient.prototype, 'eventCreate')
        .mockRejectedValue('error');

      jest.spyOn(getIdentityModule, 'getCreatorIdentity').mockImplementation();

      expect(
        creator.events['storeEvent'](1, 123, { $schema: 'mock' }, false)
      ).rejects.toThrow(/Arianee Privacy Gateway/gi);
      expect(
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

      const issuerOfSpy = jest.fn().mockResolvedValueOnce('0x123');

      const callWrapperSpy = jest
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
      expect(callWrapperSpy).toHaveBeenCalledWith(
        creator['arianeeProtocolClient'],
        creator['slug'],
        {
          protocolV1Action: expect.any(Function),
          protocolV2Action: expect.any(Function),
        },
        undefined
      );
    });

    it("should call eventCreate and store it in the smart asset owner's identity privacy gateway if the issuer is the zero address (reserved nft case)", async () => {
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

      const issuerOfSpy = jest.fn().mockResolvedValueOnce(ethers.ZeroAddress);
      const ownerOfSpy = jest.fn().mockResolvedValueOnce('0x123');

      const callWrapperSpy = jest
        .spyOn(arianeeProtocolClientModule, 'callWrapper')
        .mockImplementation(async (_, __, actions) =>
          actions.protocolV1Action({
            smartAssetContract: {
              issuerOf: issuerOfSpy,
              ownerOf: ownerOfSpy,
            },
          } as any)
        );

      await creator.events['storeEvent'](1, 123, { $schema: 'mock' }, true);

      expect(spy).toHaveBeenCalledWith('https://mock.com', {
        eventId: '123',
        content: { $schema: 'mock' },
      });

      expect(issuerOfSpy).toHaveBeenCalled();
      expect(ownerOfSpy).toHaveBeenCalled();
      expect(getIdentitySpy).toHaveBeenCalledWith(creator, '0x123');

      expect(callWrapperSpy).toHaveBeenCalledTimes(2);
      expect(callWrapperSpy).toHaveBeenCalledWith(
        creator['arianeeProtocolClient'],
        creator['slug'],
        {
          protocolV1Action: expect.any(Function),
          protocolV2Action: expect.any(Function),
        },
        undefined
      );
    });
  });
});
