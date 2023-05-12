import { Core } from '@arianee/core';
import MessageService from './message';
import WalletApiClient from '@arianee/wallet-api-client';
import EventManager from '../eventManager/eventManager';

jest.mock('@arianee/wallet-api-client');
jest.mock('../eventManager/eventManager');

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

  const eventManager = new EventManager('testnet', walletApiClient);

  const getReceivedMessagesSpy = jest
    .spyOn(walletApiClient, 'getReceivedMessages')
    .mockImplementation();

  const getMessageSpy = jest
    .spyOn(walletApiClient, 'getMessage')
    .mockImplementation();

  beforeEach(() => {
    jest.clearAllMocks();

    messageService = new MessageService(
      walletApiClient,
      eventManager,
      defaultI18nStrategy
    );
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
      }
    );
  });
});
