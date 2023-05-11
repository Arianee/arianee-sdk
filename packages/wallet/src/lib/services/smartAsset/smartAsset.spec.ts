import { Core } from '@arianee/core';
import SmartAssetService, { SmartAsset } from './smartAsset';
import WalletApiClient from '@arianee/wallet-api-client';
import EventManager from '../eventManager/eventManager';

jest.mock('@arianee/wallet-api-client');
jest.mock('../eventManager/eventManager');

const defaultI18nStrategy = {
  useLanguages: ['mo-CK'],
};

describe('SmartAssetService', () => {
  let smartAssetService: SmartAssetService<'testnet'>;
  const walletApiClient = new WalletApiClient('testnet', Core.fromRandom());
  const eventManager = new EventManager('testnet', walletApiClient);

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
