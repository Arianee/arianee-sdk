/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import { ArianeeAccessToken } from '@arianee/arianee-access-token';
import ArianeeProtocolClient from '@arianee/arianee-protocol-client';
import Core from '@arianee/core';
import * as utils from '@arianee/utils';
import { MemoryStorage } from '@arianee/utils';
import WalletApiClient from '@arianee/wallet-api-client';

import EventManager from './services/eventManager/eventManager';
import IdentityService from './services/identity/identity';
import MessageService from './services/message/message';
import SmartAssetService from './services/smartAsset/smartAsset';
import Wallet from './wallet';

jest.mock('@arianee/core');
jest.mock('@arianee/wallet-api-client');
jest.mock('@arianee/arianee-access-token');
jest.mock('@arianee/arianee-protocol-client');
jest.mock('./services/identity/identity');
jest.mock('./services/message/message');
jest.mock('./services/smartAsset/smartAsset');
jest.mock('./services/eventManager/eventManager');

jest.mock('@arianee/utils', () => {
  const originalUtils = jest.requireActual('@arianee/utils');
  return {
    ...originalUtils,
    retryFetchLike: jest.fn(),
  };
});

const mockedAddress = '0x123456';
const getAddresSpy = jest.spyOn(Wallet.prototype, 'getAddress');

describe('Wallet', () => {
  const core: Core = {
    getAddress: () => mockedAddress,
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();
    getAddresSpy.mockReturnValue(mockedAddress);
  });

  describe('constructor', () => {
    it('should use a retryFetchLike created with the defaultFetchLike if no fetch like passed', () => {
      (utils.retryFetchLike as jest.Mock).mockReturnValue(
        utils.defaultFetchLike
      );

      const wallet = new Wallet();
      expect(wallet['fetchLike']).toBe(utils.defaultFetchLike);
      expect(utils.retryFetchLike).toHaveBeenCalledWith(
        utils.defaultFetchLike,
        2
      );
    });

    it('should use testnet as default chain type', () => {
      const wallet = new Wallet();
      expect(wallet['chainType']).toBe('testnet');
    });

    it('should use a random wallet as default core', () => {
      const fromRandomSpy = jest.spyOn(Core, 'fromRandom');
      new Wallet();
      expect(fromRandomSpy).toHaveBeenCalled();
    });
    it('should use a core instance from a private key if a private key was passed', () => {
      const fromPrivateKeySpy = jest.spyOn(Core, 'fromPrivateKey');

      new Wallet({
        auth: {
          privateKey: 'privateKey',
        },
      });

      expect(fromPrivateKeySpy).toHaveBeenCalled();
    });
    it('should use a core instance from a mnemonic if a mnemonic was passed', () => {
      const fromMnemonicSpy = jest.spyOn(Core, 'fromMnemonic');

      new Wallet({
        auth: {
          mnemonic: 'mnemonic',
        },
      });

      expect(fromMnemonicSpy).toHaveBeenCalled();
    });
    it('should use the passed core instance', () => {
      const core = new Core({
        signMessage: () => ({} as any),
        signTransaction: () => ({} as any),
        getAddress: () => '',
      });

      const wallet = new Wallet({
        auth: {
          core,
        },
      });

      expect(wallet['core']).toBe(core);
    });

    it('should use MemoryStorage as default storage', () => {
      const wallet = new Wallet({
        auth: {
          core,
        },
      });

      expect(wallet['storage']).toBeInstanceOf(MemoryStorage);
    });

    it('should use the passed storage', () => {
      const memoryStorage = new MemoryStorage();

      const wallet = new Wallet({
        auth: {
          core,
        },
        storage: memoryStorage,
      });

      expect(wallet['storage']).toBe(memoryStorage);
    });

    it('should use raw as default i18n strategy', () => {
      const wallet = new Wallet();
      expect(wallet['i18nStrategy']).toBe('raw');
    });

    it('should set the arianeeAccessTokenPrefix to the passed param', () => {
      const wallet = new Wallet({
        arianeeAccessTokenPrefix: 'prefix',
      });
      expect(wallet['arianeeAccessTokenPrefix']).toBe('prefix');
    });

    it('should use @arianee/wallet-api-client as default WalletAbstraction and pass the arianeeAccessTokenPrefix', () => {
      const wallet = new Wallet({
        arianeeAccessTokenPrefix: 'prefix',
        auth: { core },
      });

      expect(wallet['walletAbstraction']).toBeInstanceOf(WalletApiClient);
      expect(WalletApiClient).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        {
          arianeeAccessToken: expect.any(ArianeeAccessToken),
          arianeeAccessTokenPrefix: 'prefix',
        },
        expect.anything()
      );
    });

    it('should throw if invalid auth was passed', () => {
      expect(() => new Wallet({ auth: {} as any })).toThrow(/invalid/gi);
    });

    it('should use the passed params over the default ones', () => {
      const chainType = 'mainnet';
      const fetchLike = () => ({} as any);
      const i18nStrategy = { useLanguages: ['en'] };
      const walletAbstraction = {} as any;
      const wallet = new Wallet({
        chainType,
        fetchLike,
        i18nStrategy,
        walletAbstraction,
      });

      expect(wallet['chainType']).toBe(chainType);
      expect(wallet['fetchLike']).toBe(fetchLike);
      expect(wallet['i18nStrategy']).toBe(i18nStrategy);
      expect(wallet['walletAbstraction']).toBe(walletAbstraction);
    });

    it('should instantiate eventManager with the correct params ', () => {
      const mockedFetchLike = () => ({} as any);

      const wallet = new Wallet({
        eventManagerParams: {
          pullInterval: 1234,
        },
        fetchLike: mockedFetchLike,
      });

      expect(EventManager).toHaveBeenCalledWith(
        'testnet',
        wallet['walletAbstraction'],
        mockedAddress,
        mockedFetchLike,
        {
          pullInterval: 1234,
        }
      );
    });

    it('should instantiate identityService with the correct params and expose it in a getter', () => {
      const wallet = new Wallet();
      expect(wallet.identity).toBeDefined();

      expect(IdentityService).toHaveBeenCalledWith(
        expect.any(WalletApiClient),
        expect.any(EventManager),
        'raw'
      );
    });

    it('should instantiate messageService with the correct params and expose it in a getter', () => {
      const wallet = new Wallet();

      expect(wallet.message).toBeDefined();

      expect(MessageService).toHaveBeenCalledWith({
        walletAbstraction: expect.any(WalletApiClient),
        eventManager: expect.any(EventManager),
        i18nStrategy: 'raw',
        arianeeProtocolClient: expect.any(ArianeeProtocolClient),
        walletRewards: wallet['walletRewards'],
        wallet,
      });
    });

    it('should instantiate smartAssetService with the correct params and expose it in a getter', () => {
      const wallet = new Wallet();

      expect(wallet.smartAsset).toBeDefined();

      expect(SmartAssetService).toHaveBeenCalledWith({
        walletAbstraction: expect.any(WalletApiClient),
        eventManager: expect.any(EventManager),
        i18nStrategy: 'raw',
        arianeeAccessToken: wallet['arianeeAccessToken'],
        arianeeProtocolClient: expect.any(ArianeeProtocolClient),
        walletRewards: wallet['walletRewards'],
        core: wallet['core'],
        wallet,
      });
    });

    it('should use the arianee access token instance if passed', () => {
      const aat = new ArianeeAccessToken({} as any);

      new Wallet({
        arianeeAccessToken: aat,
        auth: { core },
      });

      expect(WalletApiClient).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        {
          arianeeAccessToken: aat,
        },
        expect.anything()
      );
    });

    it('should instantiate arianee access token instance if not passed', () => {
      jest.spyOn(Core, 'fromRandom').mockReturnValue({} as any);

      const wallet = new Wallet();

      expect(wallet['arianeeAccessToken']).toBeInstanceOf(ArianeeAccessToken);
    });

    it('should set the walletRewards to the passed param', () => {
      const wallet = new Wallet({
        walletRewards: {
          poa: '0x1',
          sokol: '0x2',
          polygon: '0x3',
        },
      });
      expect(wallet['walletRewards']).toEqual({
        poa: '0x1',
        sokol: '0x2',
        polygon: '0x3',
      });
    });

    it('should set the walletRewards to the default value if not passed', () => {
      const wallet = new Wallet({});
      expect(wallet['walletRewards']).toEqual({
        poa: '0x39da7e30d2D5F2168AE3B8599066ab122680e1ef',
        sokol: '0xC7f2c65E88c98df41f9992a14546Ed2770e5Ac6b',
        polygon: '0x1C47291C40B86802fd42d59B186dE6C978dF8937',
      });
    });
  });

  describe('getAddress', () => {
    it('should return the address of the core instance', () => {
      getAddresSpy.mockRestore();

      const mockGetAddress = jest.fn().mockReturnValue('0x123');

      const core: Core = {
        getAddress: mockGetAddress,
      } as any;

      const wallet = new Wallet({
        auth: {
          core,
        },
      });

      expect(wallet.getAddress()).toBe('0x123');
      expect(mockGetAddress).toHaveBeenCalled();
    });
  });

  describe('authenticate', () => {
    it('should call getValidWalletAccessToken with prefix', async () => {
      const aat = new ArianeeAccessToken(core);

      const getValidWalletAccessTokenSpy = jest
        .spyOn(aat, 'getValidWalletAccessToken')
        .mockImplementation();

      const wallet = new Wallet({
        auth: { core },
        arianeeAccessToken: aat,
        arianeeAccessTokenPrefix: 'prefix',
      });

      await wallet.authenticate();

      expect(getValidWalletAccessTokenSpy).toHaveBeenCalledWith(
        {},
        { prefix: 'prefix' }
      );
    });
  });
});
