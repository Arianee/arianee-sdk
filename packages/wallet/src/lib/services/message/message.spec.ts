import * as arianeeProtocolClientModule from '@arianee/arianee-protocol-client';
import { Core } from '@arianee/core';
import WalletApiClient from '@arianee/wallet-api-client';

import EventManager from '../eventManager/eventManager';
import MessageService from './message';

jest.mock('@arianee/wallet-api-client');
jest.mock('../eventManager/eventManager');
jest.mock('@arianee/arianee-protocol-client');

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
  let messageService: MessageService<'testnet'>;
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

        getMessageSpy.mockResolvedValue({ mock: 'mock' } as any);

        const instance = await messageService.get(id, protocolName, {
          i18nStrategy,
        });

        expect(getMessageSpy).toHaveBeenCalledWith(id, protocolName, {
          preferredLanguages: expectedPreferedLanguages,
        });

        expect(instance.data).toBeDefined();
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

        getReceivedMessagesSpy.mockResolvedValue([{ mock: 'mock' } as any]);

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
      const transactionWrapperSpy = jest
        .spyOn(arianeeProtocolClientModule, 'transactionWrapper')
        .mockResolvedValue({
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
  });

  describe('blackListAddress', () => {
    it('should call the v1 contract with correct params', async () => {
      const transactionWrapperSpy = jest
        .spyOn(arianeeProtocolClientModule, 'transactionWrapper')
        .mockResolvedValue({
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
      const transactionWrapperSpy = jest
        .spyOn(arianeeProtocolClientModule, 'transactionWrapper')
        .mockResolvedValue({
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
      const transactionWrapperSpy = jest
        .spyOn(arianeeProtocolClientModule, 'transactionWrapper')
        .mockResolvedValue({
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
      const transactionWrapperSpy = jest
        .spyOn(arianeeProtocolClientModule, 'transactionWrapper')
        .mockResolvedValue({
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
  });
});
