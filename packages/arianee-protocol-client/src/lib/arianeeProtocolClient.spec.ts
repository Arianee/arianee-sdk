/* eslint-disable @typescript-eslint/no-non-null-assertion */
import Core from '@arianee/core';
import ArianeeProtocolClient from './arianeeProtocolClient';
import _fetch from 'node-fetch';
import ProtocolClientV1 from './v1/protocolClientV1';
import * as ethersProxies from './utils/ethersCustom/ethersCustom';

declare const global: {
  window: { fetch: typeof fetch } | undefined;
};

jest.mock('@arianee/core');
jest.mock('./v1/protocolClientV1');

describe('ArianeeProtocolClient', () => {
  let client: ArianeeProtocolClient;
  const fetchLike = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    client = new ArianeeProtocolClient(Core.fromRandom(), {
      fetchLike: fetchLike as unknown as typeof fetch,
    });
  });

  describe('constructor', () => {
    it('should use node-fetch in node environment as default fetch function', () => {
      const client = new ArianeeProtocolClient(Core.fromRandom());
      expect(client['fetchLike']).toBe(_fetch);
    });

    it('should use window.fetch in browser environment as default fetch function', () => {
      const mockedFetch = {
        bind: jest.fn(() => global.window!.fetch),
      } as unknown as typeof fetch;

      global.window = {
        fetch: mockedFetch,
      };

      const client = new ArianeeProtocolClient(Core.fromRandom());
      expect(client['fetchLike']).toBe(mockedFetch);

      delete global.window;
    });
  });

  describe('connect', () => {
    it.each([
      {
        caseName: 'override httpProvider',
        options: { httpProvider: 'https://overriddenProvider.com/' },
        expectedProtocolDetails: {
          httpProvider: 'https://overriddenProvider.com/',
        },
      },
      {
        caseName: 'use protocol details httpProvider',
        options: undefined,
        expectedProtocolDetails: {
          httpProvider: 'https://provider.com/',
        },
      },
    ])(
      'should return a v1 protocol client with correct params ($caseName)',
      async ({ options, expectedProtocolDetails }) => {
        const mockWallet = {};
        const ethersWalletFromCoreSpy = jest
          .spyOn(ethersProxies, 'ethersWalletFromCore')
          .mockReturnValue(mockWallet as any);

        const mockProtocolDetails = {
          httpProvider: 'https://provider.com/',
        };

        jest
          .spyOn(client as any, 'getProtocolDetailsFromSlug')
          .mockResolvedValue(mockProtocolDetails);

        const protocol = await client.connect('sokol', options);

        expect(ProtocolClientV1).toHaveBeenCalledWith(
          mockWallet,
          expectedProtocolDetails
        );

        expect('v1' in protocol).toBe(true);
      }
    );
  });

  describe('getProtocolDetailsFromSlug', () => {
    it('should throw if no protocol with the passed slug was found', async () => {
      fetchLike.mockResolvedValue({ ok: false });

      await expect(
        client['getProtocolDetailsFromSlug']('unknownSlug')
      ).rejects.toThrow('No protocol with slug unknownSlug found');
    });

    it('should return the protocol details', async () => {
      fetchLike.mockResolvedValue({
        ok: true,
        json: async () => ({
          contractAdresses: {
            contractName: '0x46F48FbdedAa6F5500993BEDE9539ef85F4BeE8e',
          },
          httpProvider: 'https://polygon.arianee.net',
          gasStation: 'https://gasstation.arianee.com/137',
          chainId: 137,
        }),
      });

      await expect(
        client['getProtocolDetailsFromSlug']('unknownSlug')
      ).resolves.toEqual({
        contractAdresses: {
          contractName: '0x46F48FbdedAa6F5500993BEDE9539ef85F4BeE8e',
        },
        httpProvider: 'https://polygon.arianee.net',
        gasStation: 'https://gasstation.arianee.com/137',
        chainId: 137,
      });
    });
  });
});