/* eslint-disable @typescript-eslint/no-non-null-assertion */
import Core from '@arianee/core';
import { defaultFetchLike } from '@arianee/utils';

import ArianeeProtocolClient from './arianeeProtocolClient';
import * as ethersProxies from './utils/ethersCustom/ethersCustom';
import ProtocolClientV1 from './v1/protocolClientV1';

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
    it('should use the defaultFetchLike if no fetch like passed', () => {
      const client = new ArianeeProtocolClient(Core.fromRandom());
      expect(client['fetchLike']).toBe(defaultFetchLike);
    });

    it('should use the protocolDetailsResolver if passed', () => {
      const mock = jest.fn();

      const client = new ArianeeProtocolClient(Core.fromRandom(), {
        protocolDetailsResolver: mock,
      });

      expect(client['protocolDetailsResolver']).toBe(mock);
    });
  });

  describe('connect', () => {
    it.each([
      {
        caseName: 'override httpProvider',
        options: { httpProvider: 'https://overriddenProvider.com/' },
        expectedProtocolDetails: {
          protocolVersion: '1',
          httpProvider: 'https://overriddenProvider.com/',
        },
      },
      {
        caseName: 'use protocol details httpProvider',
        options: undefined,
        expectedProtocolDetails: {
          protocolVersion: '1',
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
          protocolVersion: '1',
        };

        const getProtocolDetailsFromSlugSpy = jest
          .spyOn(client as any, 'getProtocolDetailsFromSlug')
          .mockResolvedValue(mockProtocolDetails);

        const protocol = await client.connect('sokol', options);

        expect(ProtocolClientV1).toHaveBeenCalledWith(
          mockWallet,
          expectedProtocolDetails
        );

        expect(protocol).toBeInstanceOf(ProtocolClientV1);
        expect(getProtocolDetailsFromSlugSpy).toHaveBeenCalledWith('sokol');
      }
    );

    it('should use the protocolDetailsResolver if set', async () => {
      const mockWallet = {};
      jest
        .spyOn(ethersProxies, 'ethersWalletFromCore')
        .mockReturnValue(mockWallet as any);

      const mockProtocolDetails = {
        httpProvider: 'https://provider.com/',
        protocolVersion: '1',
      };

      const protocolDetailsResolver = jest
        .fn()
        .mockResolvedValue(mockProtocolDetails);

      const client = new ArianeeProtocolClient(Core.fromRandom(), {
        protocolDetailsResolver,
      });

      const protocol = await client.connect('sokol');

      expect(ProtocolClientV1).toHaveBeenCalledWith(
        mockWallet,
        mockProtocolDetails
      );

      expect(protocol).toBeInstanceOf(ProtocolClientV1);
      expect(protocolDetailsResolver).toHaveBeenCalledWith('sokol');
    });
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
          protocolVersion: '1',
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
        protocolVersion: '1',
      });
    });
  });
});
