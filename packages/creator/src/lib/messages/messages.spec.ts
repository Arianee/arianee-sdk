import { ArianeePrivacyGatewayClient } from '@arianee/arianee-privacy-gateway-client';
import * as arianeeProtocolClientModule from '@arianee/arianee-protocol-client';
import { ProtocolDetailsV1 } from '@arianee/common-types';
import Core from '@arianee/core';
import { getIssuerSigTemplate__Message } from '@arianee/utils';

import Creator from '../creator';
import { ArianeePrivacyGatewayError } from '../errors';
import * as checkCreditsModule from '../helpers/checkCredits/checkCredits';
import * as getCreatorIdentityModule from '../helpers/identity/getIdentity';
import * as checkCreateMessageParametersModule from '../helpers/message/checkCreateMessageParameters';
import * as getCreateMessageParamsModule from '../helpers/message/getCreateMessageParams';
import * as getOwnershipProofStructModule from '../helpers/privacy/getOwnershipProofStruct';
import * as getContentFromURIModule from '../helpers/uri/getContentFromURI';
import { CreditType } from '../types';

jest.mock('@arianee/arianee-protocol-client');
jest.mock('@arianee/arianee-privacy-gateway-client');
jest.spyOn(console, 'error').mockImplementation();

describe('Messages', () => {
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

  describe('createAndStoreMessage', () => {
    it('should call createMessageCommon with the correct params', async () => {
      jest
        .spyOn(getCreatorIdentityModule, 'getCreatorIdentity')
        .mockImplementation();

      const params = {
        content: {
          $schema: 'test',
        },
        smartAssetId: 123,
        messageId: 456,
      };

      const createMessageCommonSpy = jest
        .spyOn(creator.messages as any, 'createMessageCommon')
        .mockImplementation();

      await creator.messages.createAndStoreMessage(params);

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

      jest
        .spyOn(getContentFromURIModule, 'getContentFromURI')
        .mockResolvedValue(content);

      const createMessageCommonSpy = jest
        .spyOn(creator.messages as any, 'createMessageCommon')
        .mockImplementation();

      await creator.messages.createMessage(params);

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

      await creator.messages['createMessageCommon'](
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
          protocolV2Action: expect.any(Function),
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
      expect(afterTransactionSpy).toHaveBeenCalledWith(456, content);
    });
    it('should call the v2 contract with correct params and return the id and imprint', async () => {
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

      const sendMessageSpy = jest.fn();

      const transactionWrapperSpy = jest
        .spyOn(arianeeProtocolClientModule, 'transactionWrapper')
        .mockImplementation(async (_, __, actions) => {
          await actions.protocolV2Action({
            messageHubContract: {
              sendMessage: sendMessageSpy,
            },
            protocolDetails: {
              contractAdresses: {
                messageHub: '0xmessage',
              },
            },
          } as any);

          return null as any;
        });

      await creator.messages['createMessageCommon'](
        {
          content,
          smartAssetId: 123,
          messageId: 456,
        },
        afterTransactionSpy
      );

      expect(sendMessageSpy).toHaveBeenCalledWith(
        '0xmessage',
        123,
        456,
        '0x0000000000000000000000000000000000000000000000000000000000000111',
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

      expect(checkCreateMessageParametersSpy).toHaveBeenCalled();
      expect(checkCreditsBalanceSpy).toHaveBeenCalledWith(
        creator['utils'],
        CreditType.message,
        BigInt(1),
        '0xmessage'
      );
      expect(getCreateMessageParamsSpy).toHaveBeenCalledWith(creator['utils'], {
        content,
        smartAssetId: 123,
        messageId: 456,
      });

      expect(calculateImprintSpy).toHaveBeenCalledWith(content);
      expect(afterTransactionSpy).toHaveBeenCalledWith(456, content);
    });
    it('should inject a valid `issuerSignature` in content and return the id, imprint and modified content if privacyMode is enabled', async () => {
      jest.spyOn(creator, 'privacyMode', 'get').mockReturnValue(true);

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

      jest
        .spyOn(
          checkCreateMessageParametersModule as any,
          'checkCreateMessageParameters'
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
              createMessage: jest.fn(),
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

      await creator.messages['createMessageCommon'](
        {
          content,
          smartAssetId: 123,
          messageId: 456,
        },
        afterTransactionSpy
      );

      expect(getCreateMessageParamsSpy).toHaveBeenCalledWith(creator['utils'], {
        content,
        smartAssetId: 123,
        messageId: 456,
      });

      const expectedIssuerSignature = await core.signMessage(
        getIssuerSigTemplate__Message(
          mockProtocolDetails as ProtocolDetailsV1,
          456
        )
      );

      expect(afterTransactionSpy).toHaveBeenCalledWith(456, {
        ...content,
        issuerSignature: expectedIssuerSignature.signature,
      });
    });
  });

  describe('storeMessage', () => {
    it('should throw an ArianeePrivacyGatewayError if the rpc call fails', async () => {
      jest
        .spyOn(ArianeePrivacyGatewayClient.prototype, 'messageCreate')
        .mockRejectedValue('error');

      jest
        .spyOn(getCreatorIdentityModule, 'getCreatorIdentity')
        .mockImplementation();

      expect(
        creator.messages['storeMessage'](123, { $schema: 'mock' })
      ).rejects.toThrow(/Arianee Privacy Gateway/gi);
      expect(
        creator.messages['storeMessage'](123, { $schema: 'mock' })
      ).rejects.toThrowError(ArianeePrivacyGatewayError);
    });

    it('should call messageCreate', async () => {
      const spy = jest
        .spyOn(ArianeePrivacyGatewayClient.prototype, 'messageCreate')
        .mockImplementation();

      jest
        .spyOn(getCreatorIdentityModule, 'getCreatorIdentity')
        .mockImplementation(
          () =>
            ({
              rpcEndpoint: 'https://mock.com',
            } as any)
        );

      await creator.messages['storeMessage'](123, { $schema: 'mock' });

      expect(spy).toHaveBeenCalledWith('https://mock.com', {
        messageId: '123',
        content: { $schema: 'mock' },
      });
    });
  });
});
