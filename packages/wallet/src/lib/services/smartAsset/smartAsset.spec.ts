import { Core } from '@arianee/core';
import SmartAssetService from './smartAsset';
import WalletApiClient from '@arianee/wallet-api-client';
import EventManager from '../eventManager/eventManager';

jest.mock('@arianee/wallet-api-client');
jest.mock('../eventManager/eventManager');

const mockSmartAssetUpdated = {} as any;
const mockSmartAssetReceived = {} as any;
const mockSmartAssetTransferred = {} as any;
const mockArianeeEventReceived = {} as any;
Object.defineProperty(EventManager.prototype, 'smartAssetUpdated', {
  get: () => mockSmartAssetUpdated,
});
Object.defineProperty(EventManager.prototype, 'smartAssetReceived', {
  get: () => mockSmartAssetReceived,
});
Object.defineProperty(EventManager.prototype, 'smartAssetTransferred', {
  get: () => mockSmartAssetTransferred,
});
Object.defineProperty(EventManager.prototype, 'arianeeEventReceived', {
  get: () => mockArianeeEventReceived,
});

const defaultI18nStrategy = {
  useLanguages: ['mo-CK'],
};

describe('SmartAssetService', () => {
  let smartAssetService: SmartAssetService<'testnet'>;
  const walletApiClient = new WalletApiClient('testnet', Core.fromRandom());
  const eventManager = new EventManager(
    'testnet',
    walletApiClient,
    '0x123456',
    jest.fn()
  );

  const getSmartAssetSpy = jest
    .spyOn(walletApiClient, 'getSmartAsset')
    .mockImplementation();

  const getSmartAssetEventsSpy = jest
    .spyOn(walletApiClient, 'getSmartAssetEvents')
    .mockImplementation();

  const getOwnedSmartAssetsSpy = jest
    .spyOn(walletApiClient, 'getOwnedSmartAssets')
    .mockImplementation();

  beforeEach(() => {
    jest.clearAllMocks();

    smartAssetService = new SmartAssetService(
      walletApiClient,
      eventManager,
      defaultI18nStrategy
    );
  });

  describe('events', () => {
    it('should expose an updated event that is a reference to eventManager.smartAssetUpdated', () => {
      expect(smartAssetService.updated).toBe(mockSmartAssetUpdated);
    });
    it('should expose a received event that is a reference to eventManager.smartAssetReceived', () => {
      expect(smartAssetService.received).toBe(mockSmartAssetReceived);
    });
    it('should expose a transferred event that is a reference to eventManager.smartAssetTransferred', () => {
      expect(smartAssetService.transferred).toBe(mockSmartAssetTransferred);
    });
    it('should expose a arianeeEventReceived event that is a reference to eventManager.arianeeEventReceived', () => {
      expect(smartAssetService.arianeeEventReceived).toBe(
        mockArianeeEventReceived
      );
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
      'should call getSmartAsset + getSmartAssetEvents and use $strategyName',
      async ({ i18nStrategy }) => {
        const protocolName = 'mockProtocol';
        const expectedPreferedLanguages = i18nStrategy
          ? i18nStrategy.useLanguages
          : defaultI18nStrategy.useLanguages;

        const smartAsset = {
          id: '1',
          passphrase: 'mock',
        };

        await smartAssetService.get(protocolName, smartAsset, {
          i18nStrategy,
        });

        expect(getSmartAssetSpy).toHaveBeenCalledWith(
          protocolName,
          smartAsset,
          {
            preferredLanguages: expectedPreferedLanguages,
          }
        );

        expect(getSmartAssetEventsSpy).toHaveBeenCalledWith(
          protocolName,
          smartAsset,
          {
            preferredLanguages: expectedPreferedLanguages,
          }
        );
      }
    );
  });

  describe('getOwned', () => {
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
      'should call getOwnedSmartAssets + getSmartAssetEvents and use the $strategyName',
      async ({ i18nStrategy }) => {
        const protocolName = 'mockProtocol';
        const expectedPreferedLanguages = i18nStrategy
          ? i18nStrategy.useLanguages
          : defaultI18nStrategy.useLanguages;

        getOwnedSmartAssetsSpy.mockResolvedValueOnce([
          {
            certificateId: '1',
            protocol: {
              name: protocolName,
              chainId: 1,
            },
          } as any,
          {
            certificateId: '2',
            protocol: {
              name: protocolName,
              chainId: 1,
            },
          } as any,
        ]);

        await smartAssetService.getOwned({
          i18nStrategy,
        });

        expect(getSmartAssetEventsSpy).toHaveBeenNthCalledWith(
          1,
          protocolName,
          {
            id: '1',
          },
          {
            preferredLanguages: expectedPreferedLanguages,
          }
        );

        expect(getSmartAssetEventsSpy).toHaveBeenCalledTimes(2);

        expect(getOwnedSmartAssetsSpy).toHaveBeenCalledWith({
          preferredLanguages: expectedPreferedLanguages,
        });
      }
    );
  });
});
