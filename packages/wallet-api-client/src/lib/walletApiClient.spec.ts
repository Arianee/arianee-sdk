/* eslint-disable @typescript-eslint/ban-ts-comment */
import { ArianeeAccessToken } from '@arianee/arianee-access-token';
import { ChainType } from '@arianee/common-types';
import { Core } from '@arianee/core';
import { defaultFetchLike } from '@arianee/utils';
import _fetch from 'node-fetch';

import { WALLET_API_URL } from './constants';
import HttpClient from './helpers/httpClient';
import WalletApiClient from './walletApiClient';

declare const global: {
  window: { fetch: typeof fetch } | undefined;
};

jest.mock('node-fetch');
jest.mock('./helpers/httpClient');
jest.mock('@arianee/arianee-access-token');

const mockedFetch = _fetch as jest.MockedFunction<typeof _fetch>;

const core = Core.fromMnemonic(
  'art success hello fold once ignore arrow damp note affair razor vital'
);
const arianeeAccessToken = new ArianeeAccessToken(core);
const httpClient = new HttpClient(
  core,
  mockedFetch as unknown as typeof fetch,
  arianeeAccessToken
);
const mockedHttpClient = httpClient as jest.Mocked<HttpClient>;

describe('WalletApiClient', () => {
  let walletApiClient: WalletApiClient<ChainType>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockedHttpClient.authorizedGet.mockResolvedValue({
      ok: true,
      json: () => ({ mock: 'mock' }),
    } as unknown as Response);

    mockedHttpClient.get.mockResolvedValue({
      ok: true,
      json: () => ({ mock: 'mock' }),
    } as unknown as Response);

    walletApiClient = new WalletApiClient(
      'testnet',
      core,
      {
        apiURL: 'https://mock',
        httpClient,
      },
      mockedFetch as unknown as typeof fetch
    );
  });

  describe('getSmartAsset', () => {
    it('should call the api with the right authorization (aat)', async () => {
      await walletApiClient.getSmartAsset('testnet', {
        id: '123456',
      });

      expect(mockedHttpClient.authorizedGet).toHaveBeenCalledWith({
        url: expect.any(String),
        authorizationType: 'arianeeAccessToken',
      });
    });

    it('should call the api with the right authorization (passphrase)', async () => {
      await walletApiClient.getSmartAsset('testnet', {
        id: '123456',
        passphrase: 'mockPassphrase',
      });

      expect(mockedHttpClient.authorizedGet).toHaveBeenCalledWith({
        url: expect.any(String),
        authorizationType: {
          certificateId: '123456',
          passphrase: 'mockPassphrase',
        },
      });
    });

    it.each([
      {
        expectedUrl: `https://mock/arianee/smartAsset/testnet/123456?filterOutBridgedEvents=true`,
        preferredLanguages: undefined,
      },
      {
        expectedUrl: `https://mock/arianee/smartAsset/testnet/123456?languages=["fr-FR"]&filterOutBridgedEvents=true`,
        preferredLanguages: ['fr-FR'],
      },
    ])(
      'should call the api with the right url and return the json (case %#)',
      async ({ expectedUrl, preferredLanguages }) => {
        const res = await walletApiClient.getSmartAsset(
          'testnet',
          {
            id: '123456',
          },
          { preferredLanguages }
        );

        expect(mockedHttpClient.authorizedGet).toHaveBeenCalledWith({
          url: expectedUrl,
          authorizationType: expect.any(String),
        });

        expect(res).toMatchObject({ mock: 'mock' });
      }
    );

    it('should throw if response is not ok', async () => {
      mockedHttpClient.authorizedGet.mockResolvedValue({
        ok: false,
      } as unknown as Response);

      await expect(
        walletApiClient.getSmartAsset('testnet', { id: '123456' })
      ).rejects.toThrowError(/error fetching/gi);
    });
  });

  describe('getSmartAssetEvents', () => {
    it('should call the api with the right authorization (aat)', async () => {
      await walletApiClient.getSmartAssetEvents('testnet', {
        id: '123456',
      });

      expect(mockedHttpClient.authorizedGet).toHaveBeenCalledWith({
        url: expect.any(String),
        authorizationType: 'arianeeAccessToken',
      });
    });

    it('should call the api with right authorization (passphrase)', async () => {
      await walletApiClient.getSmartAssetEvents('testnet', {
        id: '123456',
        passphrase: 'mockPassphrase',
      });

      expect(mockedHttpClient.authorizedGet).toHaveBeenCalledWith({
        url: expect.any(String),
        authorizationType: {
          certificateId: '123456',
          passphrase: 'mockPassphrase',
        },
      });
    });

    it.each([
      {
        expectedUrl: `https://mock/arianee/events/testnet/123456`,
        preferredLanguages: undefined,
      },
      {
        expectedUrl: `https://mock/arianee/events/testnet/123456?languages=["fr-FR"]`,
        preferredLanguages: ['fr-FR'],
      },
    ])(
      'should call the api with the right url and return the json (case %#)',
      async ({ expectedUrl, preferredLanguages }) => {
        const res = await walletApiClient.getSmartAssetEvents(
          'testnet',
          {
            id: '123456',
          },
          { preferredLanguages }
        );

        expect(mockedHttpClient.authorizedGet).toHaveBeenCalledWith({
          url: expectedUrl,
          authorizationType: 'arianeeAccessToken',
        });

        expect(res).toMatchObject({ mock: 'mock' });
      }
    );

    it('should throw if response is not ok', async () => {
      mockedHttpClient.authorizedGet.mockResolvedValue({
        ok: false,
      } as unknown as Response);

      await expect(
        walletApiClient.getSmartAssetEvents('testnet', { id: '123456' })
      ).rejects.toThrowError(/error fetching/gi);
    });
  });

  describe('getOwnedSmartAssets', () => {
    it.each([
      {
        expectedUrl: `https://mock/arianee/smartAssets/testnet/owned?filterOutBridgedEvents=true`,
        preferredLanguages: undefined,
        onlyFromBrands: undefined,
      },
      {
        expectedUrl: `https://mock/arianee/smartAssets/testnet/owned?languages=["fr-FR"]&filterOutBridgedEvents=true`,
        preferredLanguages: ['fr-FR'],
        onlyFromBrands: undefined,
      },
      {
        expectedUrl: `https://mock/arianee/smartAssets/testnet/owned?brands=["0x123"]&filterOutBridgedEvents=true`,
        preferredLanguages: undefined,
        onlyFromBrands: ['0x123'],
      },
      {
        expectedUrl: `https://mock/arianee/smartAssets/testnet/owned?brands=["0x123"]&languages=["fr-FR"]&filterOutBridgedEvents=true`,
        preferredLanguages: ['fr-FR'],
        onlyFromBrands: ['0x123'],
      },
    ])(
      'should call the api with the right url and return the json (case %#)',
      async ({ expectedUrl, preferredLanguages, onlyFromBrands }) => {
        const res = await walletApiClient.getOwnedSmartAssets({
          preferredLanguages,
          onlyFromBrands,
        });

        expect(mockedHttpClient.authorizedGet).toHaveBeenCalledWith({
          url: expectedUrl,
        });

        expect(res).toMatchObject({ mock: 'mock' });
      }
    );

    it('should throw if response is not ok', async () => {
      mockedHttpClient.authorizedGet.mockResolvedValue({
        ok: false,
      } as unknown as Response);

      await expect(walletApiClient.getOwnedSmartAssets()).rejects.toThrowError(
        /error fetching/gi
      );
    });
  });

  describe('getReceivedMessages', () => {
    it.each([
      {
        expectedUrl: `https://mock/arianee/messages/testnet/received`,
        preferredLanguages: undefined,
      },
      {
        expectedUrl: `https://mock/arianee/messages/testnet/received?languages=["fr-FR"]`,
        preferredLanguages: ['fr-FR'],
      },
    ])(
      'should call the api with the right url and return the json (case %#)',
      async ({ preferredLanguages, expectedUrl }) => {
        const res = await walletApiClient.getReceivedMessages({
          preferredLanguages,
        });

        expect(mockedHttpClient.authorizedGet).toHaveBeenCalledWith({
          url: expectedUrl,
        });

        expect(res).toMatchObject({ mock: 'mock' });
      }
    );

    it('should throw if response is not ok', async () => {
      mockedHttpClient.authorizedGet.mockResolvedValue({
        ok: false,
      } as unknown as Response);

      await expect(walletApiClient.getReceivedMessages()).rejects.toThrowError(
        /error fetching/gi
      );
    });
  });

  describe('getMessage', () => {
    it.each([
      {
        expectedUrl: `https://mock/arianee/message/testnet/1`,
        preferredLanguages: undefined,
      },
      {
        expectedUrl: `https://mock/arianee/message/testnet/1?languages=["fr-FR"]`,
        preferredLanguages: ['fr-FR'],
      },
    ])(
      'should call the api with the right url and return the json (case %#)',
      async ({ preferredLanguages, expectedUrl }) => {
        const res = await walletApiClient.getMessage('1', 'testnet', {
          preferredLanguages,
        });

        expect(mockedHttpClient.authorizedGet).toHaveBeenCalledWith({
          url: expectedUrl,
        });

        expect(res).toMatchObject({ mock: 'mock' });
      }
    );

    it('should throw if response is not ok', async () => {
      mockedHttpClient.authorizedGet.mockResolvedValue({
        ok: false,
      } as unknown as Response);

      await expect(
        walletApiClient.getMessage('1', 'testnet')
      ).rejects.toThrowError(/error fetching/gi);
    });
  });

  describe('getBrandIdentity', () => {
    it.each([
      {
        expectedUrl: `https://mock/arianee/brandIdentity/0x123456`,
        preferredLanguages: undefined,
      },
      {
        expectedUrl: `https://mock/arianee/brandIdentity/0x123456?languages=["fr-FR"]`,
        preferredLanguages: ['fr-FR'],
      },
    ])(
      'should call the api with the right url and return the json (case %#)',
      async ({ preferredLanguages, expectedUrl }) => {
        const res = await walletApiClient.getBrandIdentity('0x123456', {
          preferredLanguages,
        });

        expect(mockedHttpClient.get).toHaveBeenCalledWith(expectedUrl);

        expect(res).toMatchObject({ mock: 'mock' });
      }
    );

    it('should throw if response is not ok', async () => {
      mockedHttpClient.get.mockResolvedValue({
        ok: false,
      } as unknown as Response);

      await expect(
        walletApiClient.getBrandIdentity('0x123456')
      ).rejects.toThrowError(/error fetching/gi);
    });
  });
  describe('getOwnedSmartAssetsBrandIdentities', () => {
    it.each([
      {
        expectedUrl: `https://mock/arianee/brandIdentities/testnet/owned/${core.getAddress()}`,
        preferredLanguages: undefined,
      },
      {
        expectedUrl: `https://mock/arianee/brandIdentities/testnet/owned/${core.getAddress()}?languages=["fr-FR"]`,
        preferredLanguages: ['fr-FR'],
      },
    ])(
      'should call the api with the right url and return the json (case %#)',
      async ({ expectedUrl, preferredLanguages }) => {
        const res = await walletApiClient.getOwnedSmartAssetsBrandIdentities({
          preferredLanguages,
        });

        expect(mockedHttpClient.get).toHaveBeenCalledWith(expectedUrl);
        expect(res).toMatchObject({ mock: 'mock' });
      }
    );

    it('should throw if response is not ok', async () => {
      mockedHttpClient.get.mockResolvedValue({
        ok: false,
      } as unknown as Response);

      await expect(
        walletApiClient.getOwnedSmartAssetsBrandIdentities({})
      ).rejects.toThrowError(/error fetching/gi);
    });
  });

  describe('handleLink', () => {
    it('should call the api with the right url and return the data', async () => {
      mockedHttpClient.post.mockResolvedValue({
        ok: true,
        json: async () => ({ mock: 'mock' }),
      } as any);

      const res = await walletApiClient.handleLink('https://mock', {
        arianeeAccessToken: 'aat',
        resolveFinalNft: true,
      });

      expect(mockedHttpClient.post).toHaveBeenCalledWith(
        'https://mock/arianee/link/handle',
        {
          link: 'https://mock',
          arianeeAccessToken: 'aat',
          resolveFinalNft: true,
          filterOutBridgedEvents: true,
        }
      );

      expect(res).toEqual({ mock: 'mock' });
    });

    it('should throw if response is not ok', async () => {
      mockedHttpClient.post.mockResolvedValue({
        ok: false,
      } as unknown as Response);

      await expect(
        walletApiClient.handleLink('https://mock', {
          arianeeAccessToken: 'aat',
          resolveFinalNft: true,
        })
      ).rejects.toThrowError(/Failed to handle link/gi);
    });
  });

  describe('linkToSmartAsset', () => {
    it('should call the api with the right url and return the data', async () => {
      mockedHttpClient.post.mockResolvedValue({
        ok: true,
        json: async () => ({ mock: 'mock' }),
      } as any);

      const res = await walletApiClient.linkToSmartAsset('https://mock', {
        arianeeAccessToken: 'aat',
        resolveFinalNft: true,
      });

      expect(mockedHttpClient.post).toHaveBeenCalledWith(
        'https://mock/arianee/link/toSmartAsset',
        {
          link: 'https://mock',
          arianeeAccessToken: 'aat',
          resolveFinalNft: true,
        }
      );

      expect(res).toEqual({ mock: 'mock' });
    });

    it('should throw if response is not ok', async () => {
      mockedHttpClient.post.mockResolvedValue({
        ok: false,
      } as unknown as Response);

      await expect(
        walletApiClient.linkToSmartAsset('https://mock', {
          arianeeAccessToken: 'aat',
          resolveFinalNft: true,
        })
      ).rejects.toThrowError(/Failed to get smart asset from link/gi);
    });
  });

  describe('constructor', () => {
    it('should use node-fetch in node environment as default fetch function', async () => {
      const client = new WalletApiClient('testnet', core);
      // @ts-ignore
      expect(client['fetchLike']).toBe(defaultFetchLike);
    });

    it('should use the WALLET_API_URL without trailing slash if no apiURL is provided', async () => {
      const client = new WalletApiClient('testnet', core);

      expect(client['apiURL']).toBe(WALLET_API_URL.slice(0, -1));
    });

    it('should use options.apiURL without trailing slash if provided', async () => {
      const client = new WalletApiClient('testnet', core, {
        apiURL: 'https://mock/',
      });

      expect(client['apiURL']).toBe('https://mock');
    });

    it('should use options.httpClient if provided', async () => {
      const client = new WalletApiClient('testnet', core, {
        httpClient,
      });

      expect(client['httpClient']).toBe(httpClient);
    });

    it('should use the arianee access token instance if passed', () => {
      const client = new WalletApiClient('testnet', core, {
        arianeeAccessToken,
        arianeeAccessTokenPrefix: 'prefix',
      });

      expect(HttpClient).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        arianeeAccessToken,
        'prefix'
      );
    });

    it('should instantiate arianee access token instance if not passed', () => {
      const client = new WalletApiClient('testnet', core, {
        httpClient,
      });

      expect(ArianeeAccessToken).toHaveBeenCalledWith(core);
    });
  });
});
