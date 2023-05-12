import { Core } from '@arianee/core';
import IdentityService from './identity';
import WalletApiClient from '@arianee/wallet-api-client';
import EventManager from '../eventManager/eventManager';

jest.mock('@arianee/wallet-api-client');
jest.mock('../eventManager/eventManager');

const mockIdentityUpdated = {} as any;
Object.defineProperty(EventManager.prototype, 'identityUpdated', {
  get: () => mockIdentityUpdated,
});

const defaultI18nStrategy = {
  useLanguages: ['mo-CK'],
};

describe('IdentityService', () => {
  let identityService: IdentityService<'testnet'>;
  const walletApiClient = new WalletApiClient('testnet', Core.fromRandom());

  const eventManager = new EventManager('testnet', walletApiClient);

  const getOwnedSmartAssetsBrandIdentitiesSpy = jest
    .spyOn(walletApiClient, 'getOwnedSmartAssetsBrandIdentities')
    .mockImplementation();

  const getBrandIdentitySpy = jest
    .spyOn(walletApiClient, 'getBrandIdentity')
    .mockImplementation();

  beforeEach(() => {
    jest.clearAllMocks();

    identityService = new IdentityService(
      walletApiClient,
      eventManager,
      defaultI18nStrategy
    );
  });

  describe('events', () => {
    it('should expose an updated event that is a reference to eventManager.identityUpdated', () => {
      expect(identityService.updated).toBe(mockIdentityUpdated);
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
      'should call getBrandIdentity and use $strategyName',
      async ({ i18nStrategy }) => {
        const expectedPreferedLanguages = i18nStrategy
          ? i18nStrategy.useLanguages
          : defaultI18nStrategy.useLanguages;

        const issuer = '0x123';

        getBrandIdentitySpy.mockResolvedValue({ mock: 'mock' } as any);

        const instance = await identityService.get(issuer, {
          i18nStrategy,
        });

        expect(getBrandIdentitySpy).toHaveBeenCalledWith(issuer, {
          preferredLanguages: expectedPreferedLanguages,
        });

        expect(instance.data).toBeDefined();
      }
    );
  });

  describe('getOwnedSmartAssetsIdentities', () => {
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
      'should call getOwnedSmartAssetsBrandIdentities and use the $strategyName',
      async ({ i18nStrategy }) => {
        const expectedPreferedLanguages = i18nStrategy
          ? i18nStrategy.useLanguages
          : defaultI18nStrategy.useLanguages;

        getOwnedSmartAssetsBrandIdentitiesSpy.mockResolvedValue([
          { mock: 'mock' } as any,
        ]);

        const instances = await identityService.getOwnedSmartAssetsIdentities({
          i18nStrategy,
        });

        expect(getOwnedSmartAssetsBrandIdentitiesSpy).toHaveBeenCalledWith({
          preferredLanguages: expectedPreferedLanguages,
        });

        expect(instances[0].data).toBeDefined();
      }
    );
  });
});
