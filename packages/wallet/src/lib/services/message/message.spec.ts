import * as arianeeProtocolClientModule from '@arianee/arianee-protocol-client';
import { DecentralizedMessage } from '@arianee/common-types';
import { Core } from '@arianee/core';
import { getIssuerSigTemplate__Message } from '@arianee/utils';
import WalletApiClient from '@arianee/wallet-api-client';

import { instanceFactory } from '../../utils/instanceFactory/instanceFactory';
import Wallet from '../../wallet';
import EventManager from '../eventManager/eventManager';
import MessageInstance from './instances/messageInstance';
import MessageService from './message';

jest.mock('@arianee/wallet-api-client');
jest.mock('../eventManager/eventManager');
jest.mock('@arianee/arianee-protocol-client');

jest.mock('@arianee/utils', () => {
  const originalUtils = jest.requireActual('@arianee/utils');
  return {
    ...originalUtils,
    calculateImprint: jest
      .fn()
      .mockResolvedValue(
        '0x89e013482d6d267b99f6d1573755ca02067c04f01e6be972aa40c5de2cde601a'
      ),
  };
});

const mockMessageReceived = {} as any;
const mockMessageRead = {} as any;
Object.defineProperty(EventManager.prototype, 'messageReceived', {
  get: () => mockMessageReceived,
});
Object.defineProperty(EventManager.prototype, 'messageRead', {
  get: () => mockMessageRead,
});

const defaultI18nStrategy = {
  useLanguages: ['mo-CK'],
};

describe('MessageService', () => {
  let messageService: MessageService<'testnet', 'WAIT_TRANSACTION_RECEIPT'>;
  const walletApiClient = new WalletApiClient('testnet', Core.fromRandom());
  const core = Core.fromRandom();
  const arianeeProtocolClient =
    new arianeeProtocolClientModule.ArianeeProtocolClient(core);
  const walletRewards = {
    poa: '0x0',
    sokol: '0x1',
    polygon: '0x2',
  };
  const eventManager = new EventManager(
    'testnet',
    walletApiClient,
    '0x123456',
    jest.fn()
  );

  const connectedWalletAddress = '0xABCDEF';

  const transactionWrapperSpy = jest.fn();
  const wallet = {
    transactionWrapper: transactionWrapperSpy,
    getAddress: () => connectedWalletAddress,
  };

  const getReceivedMessagesSpy = jest
    .spyOn(walletApiClient, 'getReceivedMessages')
    .mockImplementation();

  const getMessageSpy = jest
    .spyOn(walletApiClient, 'getMessage')
    .mockImplementation();

  beforeEach(() => {
    jest.clearAllMocks();

    messageService = new MessageService({
      walletAbstraction: walletApiClient,
      eventManager: eventManager,
      i18nStrategy: defaultI18nStrategy,
      arianeeProtocolClient: arianeeProtocolClient,
      walletRewards: walletRewards,
      wallet: wallet as unknown as Wallet,
    });
  });

  describe('events', () => {
    it('should expose a received event that is a reference to eventManager.messageReceived', () => {
      expect(messageService.received).toBe(mockMessageReceived);
    });
    it('should expose a read event that is a reference to eventManager.messageRead', () => {
      expect(messageService.read).toBe(mockMessageRead);
    });
  });

  describe('get', () => {
    it.each([
      {
        strategyName: 'default i18nStrategy',
        i18nStrategy: undefined,
      },
      {
        strategyName: 'params i18nStrategy',
        i18nStrategy: {
          useLanguages: ['te-ST'],
        },
      },
    ])(
      'should call getMessage and use the $strategyName',
      async ({ i18nStrategy }) => {
        const expectedPreferedLanguages = i18nStrategy
          ? i18nStrategy.useLanguages
          : defaultI18nStrategy.useLanguages;

        const id = '1';
        const protocolName = 'testnet';

        getMessageSpy.mockResolvedValue({
          imprint:
            '0x89e013482d6d267b99f6d1573755ca02067c04f01e6be972aa40c5de2cde601a',
          rawContent: {
            $schema:
              'https://cert.arianee.org/version5/ArianeeProductCertificate-i18n.json',
          },
        } as any);

        const instance = await messageService.get(id, protocolName, {
          i18nStrategy,
        });

        expect(getMessageSpy).toHaveBeenCalledWith(id, protocolName, {
          preferredLanguages: expectedPreferedLanguages,
        });

        expect(instance.data).toBeDefined();
        expect(instance.data.isAuthentic).toBeTruthy();
        expect(instance.readMessage).toEqual(expect.any(Function));
      }
    );
  });

  describe('getReceived', () => {
    it.each([
      {
        strategyName: 'default i18nStrategy',
        i18nStrategy: undefined,
      },
      {
        strategyName: 'params i18nStrategy',
        i18nStrategy: {
          useLanguages: ['te-ST'],
        },
      },
    ])(
      'should call getReceivedMessages and use the $strategyName',
      async ({ i18nStrategy }) => {
        const expectedPreferedLanguages = i18nStrategy
          ? i18nStrategy.useLanguages
          : defaultI18nStrategy.useLanguages;

        getReceivedMessagesSpy.mockResolvedValue([
          {
            imprint:
              '0x89e013482d6d267b99f6d1573755ca02067c04f01e6be972aa40c5de2cde601a',
            rawContent: {
              $schema:
                'https://cert.arianee.org/version5/ArianeeProductCertificate-i18n.json',
            },
          } as any,
        ]);

        const instances = await messageService.getReceived({
          i18nStrategy,
        });

        expect(getReceivedMessagesSpy).toHaveBeenCalledWith({
          preferredLanguages: expectedPreferedLanguages,
        });

        expect(instances[0].data).toBeDefined();
        expect(instances[0].readMessage).toEqual(expect.any(Function));
      }
    );
  });

  describe('readMessage', () => {
    it('should call the v1 contract with correct params', async () => {
      transactionWrapperSpy.mockResolvedValue({
        mockReceipt: '0x123',
      } as any);

      const waitSpy = jest.fn().mockResolvedValue({ mockReceipt: '0x123' });
      const readMessageSpy = jest.fn().mockResolvedValue({
        wait: waitSpy,
      });

      await messageService.readMessage('mockProtocol', '123');

      const { protocolV1Action } = transactionWrapperSpy.mock.calls[0][2];

      await protocolV1Action({
        storeContract: {
          readMessage: readMessageSpy,
        },
      } as any);

      expect(readMessageSpy).toHaveBeenCalledWith('123', '0x2', {});

      expect(transactionWrapperSpy).toHaveBeenCalledWith(
        arianeeProtocolClient,
        'mockProtocol',
        {
          protocolV1Action: expect.any(Function),
          protocolV2Action: expect.any(Function),
        }
      );
    });
    it('should call the v2 contract with correct params', async () => {
      transactionWrapperSpy.mockResolvedValue({
        mockReceipt: '0x123',
      } as any);

      const waitSpy = jest.fn().mockResolvedValue({ mockReceipt: '0x123' });
      const readMessageSpy = jest.fn().mockResolvedValue({
        wait: waitSpy,
      });

      await messageService.readMessage('mockProtocol', '123');
      const { protocolV2Action } = transactionWrapperSpy.mock.calls[0][2];

      await protocolV2Action({
        messageHubContract: {
          markMessageAsRead: readMessageSpy,
        },
        protocolDetails: {
          contractAdresses: {
            nft: '0x0000',
          },
        },
      } as any);

      expect(readMessageSpy).toHaveBeenCalledWith('0x0000', '123', '0x2');

      expect(transactionWrapperSpy).toHaveBeenCalledWith(
        arianeeProtocolClient,
        'mockProtocol',
        {
          protocolV1Action: expect.any(Function),
          protocolV2Action: expect.any(Function),
        }
      );
    });
  });

  describe('blackListAddress', () => {
    it('should call the v1 contract with correct params', async () => {
      transactionWrapperSpy.mockResolvedValue({
        mockReceipt: '0x123',
      } as any);

      const waitSpy = jest.fn().mockResolvedValue({ mockReceipt: '0x123' });
      const addBlacklistedAddressSpy = jest.fn().mockResolvedValue({
        wait: waitSpy,
      });

      await messageService.blackListAddress('mockProtocol', '0x123', '23');

      const { protocolV1Action } = transactionWrapperSpy.mock.calls[0][2];

      await protocolV1Action({
        whitelistContract: {
          addBlacklistedAddress: addBlacklistedAddressSpy,
        },
      } as any);

      expect(addBlacklistedAddressSpy).toHaveBeenCalledWith(
        '0x123',
        '23',
        true,
        {}
      );

      expect(transactionWrapperSpy).toHaveBeenCalledWith(
        arianeeProtocolClient,
        'mockProtocol',
        {
          protocolV1Action: expect.any(Function),
          protocolV2Action: expect.any(Function),
        }
      );
    });
    it('should call the v2 contract with correct params', async () => {
      transactionWrapperSpy.mockResolvedValue({
        mockReceipt: '0x123',
      } as any);

      const waitSpy = jest.fn().mockResolvedValue({ mockReceipt: '0x123' });
      const addMsgPerTokenBlacklistSpy = jest.fn().mockResolvedValue({
        wait: waitSpy,
      });
      const removeMsgPerTokenBlacklistSpy = jest.fn();

      await messageService.blackListAddress('mockProtocol', '0x123', '23');

      const { protocolV2Action } = transactionWrapperSpy.mock.calls[0][2];

      await protocolV2Action({
        rulesManagerContract: {
          addMsgPerTokenBlacklist: addMsgPerTokenBlacklistSpy,
          removeMsgPerTokenBlacklist: removeMsgPerTokenBlacklistSpy,
        },
        protocolDetails: {
          contractAdresses: {
            nft: '0x2',
          },
        },
      } as any);

      expect(addMsgPerTokenBlacklistSpy).toHaveBeenCalledWith('0x2', '23', [
        '0x123',
      ]);
      expect(removeMsgPerTokenBlacklistSpy).not.toHaveBeenCalled();

      expect(transactionWrapperSpy).toHaveBeenCalledWith(
        arianeeProtocolClient,
        'mockProtocol',
        {
          protocolV1Action: expect.any(Function),
          protocolV2Action: expect.any(Function),
        }
      );
    });
  });

  describe('unblackListAddress', () => {
    it('should call the v1 contract with correct params', async () => {
      transactionWrapperSpy.mockResolvedValue({
        mockReceipt: '0x123',
      } as any);

      const waitSpy = jest.fn().mockResolvedValue({ mockReceipt: '0x123' });
      const addBlacklistedAddressSpy = jest.fn().mockResolvedValue({
        wait: waitSpy,
      });

      await messageService.unblackListAddress('mockProtocol', '0x123', '23');

      const { protocolV1Action } = transactionWrapperSpy.mock.calls[0][2];

      await protocolV1Action({
        whitelistContract: {
          addBlacklistedAddress: addBlacklistedAddressSpy,
        },
      } as any);

      expect(addBlacklistedAddressSpy).toHaveBeenCalledWith(
        '0x123',
        '23',
        false,
        {}
      );

      expect(transactionWrapperSpy).toHaveBeenCalledWith(
        arianeeProtocolClient,
        'mockProtocol',
        {
          protocolV1Action: expect.any(Function),
          protocolV2Action: expect.any(Function),
        }
      );
    });
    it('should call the v2 contract with correct params', async () => {
      transactionWrapperSpy.mockResolvedValue({
        mockReceipt: '0x123',
      } as any);

      const waitSpy = jest.fn().mockResolvedValue({ mockReceipt: '0x123' });
      const addMsgPerTokenBlacklistSpy = jest.fn();
      const removeMsgPerTokenBlacklistSpy = jest.fn().mockResolvedValue({
        wait: waitSpy,
      });

      await messageService.unblackListAddress('mockProtocol', '0x123', '23');

      const { protocolV2Action } = transactionWrapperSpy.mock.calls[0][2];

      await protocolV2Action({
        rulesManagerContract: {
          addMsgPerTokenBlacklist: addMsgPerTokenBlacklistSpy,
          removeMsgPerTokenBlacklist: removeMsgPerTokenBlacklistSpy,
        },
        protocolDetails: {
          contractAdresses: {
            nft: '0x2',
          },
        },
      } as any);

      expect(removeMsgPerTokenBlacklistSpy).toHaveBeenCalledWith('0x2', '23', [
        '0x123',
      ]);
      expect(addMsgPerTokenBlacklistSpy).not.toHaveBeenCalled();

      expect(transactionWrapperSpy).toHaveBeenCalledWith(
        arianeeProtocolClient,
        'mockProtocol',
        {
          protocolV1Action: expect.any(Function),
          protocolV2Action: expect.any(Function),
        }
      );
    });

    describe('isBlacklisted', () => {
      it('should call the v1 contract with correct params and return the result', async () => {
        const isBlacklistedSpy = jest.fn().mockResolvedValue(true);

        const callWrapperSpy = jest
          .spyOn(arianeeProtocolClientModule, 'callWrapper')
          .mockImplementation(
            async (_, __, actions) =>
              await actions.protocolV1Action({
                whitelistContract: {
                  isBlacklisted: isBlacklistedSpy,
                },
              } as any)
          );

        const isBlacklisted = await messageService.isBlacklisted(
          'testnet',
          '0x123',
          '1'
        );

        expect(isBlacklistedSpy).toHaveBeenCalledWith(
          connectedWalletAddress,
          '0x123',
          '1'
        );

        expect(callWrapperSpy).toHaveBeenCalledWith(
          arianeeProtocolClient,
          'testnet',
          {
            protocolV1Action: expect.any(Function),
            protocolV2Action: expect.any(Function),
          },
          undefined
        );

        expect(isBlacklisted).toBeTruthy();
      });
    });
  });

  describe('instanceFactory', () => {
    it('should override messageInstance.data.sender if a signature is present', async () => {
      const mockProtocolDetails: any = {
        chainId: 666,
        contractAdresses: {
          smartAsset:
            '0x0000000000000000000000000000000000000000000000000000000000000001',
        },
      };

      const core = Core.fromRandom();
      const { signature: issuerSig } = await core.signMessage(
        getIssuerSigTemplate__Message(mockProtocolDetails, 456)
      );

      const mockMessage: Partial<DecentralizedMessage> = {
        certificateId: '123',
        id: '456',
        sender: 'mockSender',
        imprint: 'mockImprint',
        rawContent: {
          $schema: 'mockSchema',
          issuer_signature: issuerSig,
        },
        protocol: {
          chainId: 666,
          name: 'mockProtocolName',
        },
      };

      const mockProtocolClient = {
        connect: jest.fn().mockResolvedValue({
          protocolDetails: mockProtocolDetails,
        }),
      };

      const messageInstance = await instanceFactory(
        MessageInstance,
        [messageService, mockMessage as any],
        {} as any,
        mockProtocolClient as any
      );

      expect(messageInstance.data.rawContent.issuer_signature).toBe(issuerSig);
      expect(messageInstance.data.sender).toBe(core.getAddress());
    });
  });
});
