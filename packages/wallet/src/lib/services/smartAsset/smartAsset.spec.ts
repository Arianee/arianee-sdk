import { Core } from '@arianee/core';
import SmartAssetService from './smartAsset';
import WalletApiClient from '@arianee/wallet-api-client';
import EventManager from '../eventManager/eventManager';
import { ArianeeAccessToken } from '@arianee/arianee-access-token';

jest.mock('@arianee/wallet-api-client');
jest.mock('@arianee/arianee-access-token');
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
  const core = Core.fromRandom();
  const walletApiClient = new WalletApiClient('testnet', core);
  const arianeeAccessToken = new ArianeeAccessToken(core);
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
      defaultI18nStrategy,
      arianeeAccessToken
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
  describe('getFromLink', () => {
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
      'should call walletApiClient.handleLink and call get with the correct params (using $strategyName)',
      async ({ i18nStrategy }) => {
        const mockGet = {
          data: {
            certificateId: '123',
            protocol: {
              name: 'testnet',
              chainId: 1,
            },
          },
          arianeeEvents: [],
        };

        const expectedI18NStrategy = i18nStrategy ?? defaultI18nStrategy;

        const getSpy = jest
          .spyOn(smartAssetService, 'get')
          .mockResolvedValueOnce(mockGet as any);

        const handleLinkSpy = jest
          .spyOn(WalletApiClient.prototype, 'handleLink')
          .mockResolvedValue({
            certificateId: '123',
            passphrase: 'abc',
            network: 'testnet',
            method: 'requestOwnership',
            link: 'https://test.arian.ee/123,abc',
          });

        const getValidWalletAccessTokenSpy = jest
          .spyOn(ArianeeAccessToken.prototype, 'getValidWalletAccessToken')
          .mockResolvedValue('mockAccessToken');

        const smartAsset = await smartAssetService.getFromLink(
          'https://test.arian.ee/123,abc',
          true,
          i18nStrategy
        );

        expect(handleLinkSpy).toHaveBeenCalledWith(
          'https://test.arian.ee/123,abc',
          {
            resolveFinalNft: true,
            arianeeAccessToken: 'mockAccessToken',
          }
        );

        expect(getValidWalletAccessTokenSpy).toHaveBeenCalled();
        expect(getSpy).toHaveBeenCalledWith(
          'testnet',
          {
            id: '123',
            passphrase: 'abc',
          },
          {
            i18nStrategy: expectedI18NStrategy,
          }
        );

        expect(smartAsset).toEqual(mockGet);
      }
    );

    it('should throw if the wallet abstraction is not a WalletApiClient', async () => {
      const smartAssetService = new SmartAssetService(
        {} as any,
        eventManager,
        defaultI18nStrategy,
        arianeeAccessToken
      );

      await expect(
        smartAssetService.getFromLink('https://test.arian.ee/123,abc')
      ).rejects.toThrowError(
        'The wallet abstraction you use do not support this method'
      );
    });

    it('should throw if no smart asset can be retrieved from the link', async () => {
      jest
        .spyOn(WalletApiClient.prototype, 'handleLink')
        .mockRejectedValue(new Error('mockError'));

      await expect(
        smartAssetService.getFromLink('https://test.arian.ee/123,abc')
      ).rejects.toThrowError('Could not retrieve a smart asset from this link');
    });
  });
});
