/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import Wallet from './wallet';
import _fetch from 'node-fetch';
import Core from '@arianee/core';
import WalletApiClient from '@arianee/wallet-api-client';
import IdentityService from './services/identity/identity';
import SmartAssetService from './services/smartAsset/smartAsset';
import MessageService from './services/message/message';

declare const global: {
  window: { fetch: typeof fetch } | undefined;
};

jest.mock('@arianee/core');
jest.mock('./services/identity/identity');
jest.mock('./services/message/message');
jest.mock('./services/smartAsset/smartAsset');

describe('Wallet', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should use node-fetch in node environment as default fetch function', () => {
      const wallet = new Wallet();
      expect(wallet['fetchLike']).toBe(_fetch);
    });

    it('should use window.fetch in browser environment as default fetch function', () => {
      global.window = { fetch: {} as unknown as typeof fetch };

      const wallet = new Wallet();
      expect(wallet['fetchLike']).toBe(global.window.fetch);

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

    /* TODO: update tests to add the constructor params once the services have been created */
    it('should instantiate identityService with the correct params and expose it in a getter', () => {
      const wallet = new Wallet();
      expect(wallet.identity).toBeDefined();
      expect(IdentityService).toHaveBeenCalledWith(); // add constructor params here
    });

    it('should instantiate messageService with the correct params and expose it in a getter', () => {
      const wallet = new Wallet();
      expect(wallet.message).toBeDefined();
      expect(MessageService).toHaveBeenCalledWith(); // add constructor params here
    });

    it('should instantiate smartAssetService with the correct params and expose it in a getter', () => {
      const wallet = new Wallet();
      expect(wallet.smartAsset).toBeDefined();
      expect(SmartAssetService).toHaveBeenCalledWith(); // add constructor params here
    });
  });
});
