/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import Wallet from './wallet';
import _fetch from 'node-fetch';
import Core from '@arianee/core';
import WalletApiClient from '@arianee/wallet-api-client';
import IdentityService from './services/identity/identity';
import SmartAssetService from './services/smartAsset/smartAsset';
import MessageService from './services/message/message';
import EventManager from './services/eventManager/eventManager';

declare const global: {
  window: { fetch: typeof fetch } | undefined;
};

jest.mock('@arianee/core');
jest.mock('./services/identity/identity');
jest.mock('./services/message/message');
jest.mock('./services/smartAsset/smartAsset');
jest.mock('./services/eventManager/eventManager');

const mockedAddress = '0x123456';
const getAddresSpy = jest.spyOn(Wallet.prototype, 'getAddress');

describe('Wallet', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getAddresSpy.mockReturnValue(mockedAddress);
  });

  describe('constructor', () => {
    it('should use node-fetch in node environment as default fetch function', () => {
      const wallet = new Wallet();
      expect(wallet['fetchLike']).toBe(_fetch);
    });

    it('should use window.fetch in browser environment as default fetch function', () => {
      const mockedFetch = {
        bind: jest.fn(() => global.window!.fetch),
      } as unknown as typeof fetch;

      global.window = {
        fetch: mockedFetch,
      };

      const wallet = new Wallet();
      expect(wallet['fetchLike']).toBe(mockedFetch);

      delete global.window;
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
      const core = new Core(
        () => ({} as any),
        () => ({} as any),
        () => ''
      );

      const wallet = new Wallet({
        auth: {
          core,
        },
      });

      expect(wallet['core']).toBe(core);
    });

    it('should use raw as default i18n strategy', () => {
      const wallet = new Wallet();
      expect(wallet['i18nStrategy']).toBe('raw');
    });

    it('should use @arianee/wallet-api-client as default WalletAbstraction', () => {
      const wallet = new Wallet();
      expect(wallet['walletAbstraction']).toBeInstanceOf(WalletApiClient);
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

      expect(MessageService).toHaveBeenCalledWith(
        expect.any(WalletApiClient),
        expect.any(EventManager),
        'raw'
      );
    });

    it('should instantiate smartAssetService with the correct params and expose it in a getter', () => {
      const wallet = new Wallet();

      expect(wallet.smartAsset).toBeDefined();

      expect(SmartAssetService).toHaveBeenCalledWith(
        expect.any(WalletApiClient),
        expect.any(EventManager),
        'raw'
      );
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
});
