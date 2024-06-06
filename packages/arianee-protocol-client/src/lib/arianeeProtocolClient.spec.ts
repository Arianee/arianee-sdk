/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { ProtocolDetailsV1, ProtocolDetailsV2 } from '@arianee/common-types';
import Core from '@arianee/core';
import * as utils from '@arianee/utils';

import ArianeeProtocolClient from './arianeeProtocolClient';
import ProtocolClientV1 from './v1/protocolClientV1';

jest.mock('@arianee/utils', () => {
  const originalUtils = jest.requireActual('@arianee/utils');
  return {
    ...originalUtils,
    retryFetchLike: jest.fn(),
    cachedFetchLike: jest.fn(),
    ethersWalletFromCore: jest.fn(),
  };
});

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
    it('should use a cachedFetchLike and retryFetchLike created with the defaultFetchLike if no fetch like passed', () => {
      const mockFetchLike = jest.fn();

      (utils.retryFetchLike as jest.Mock).mockReturnValue(
        mockFetchLike as unknown as typeof utils.defaultFetchLike
      );

      (utils.cachedFetchLike as jest.Mock).mockReturnValue(mockFetchLike);

      const client = new ArianeeProtocolClient(Core.fromRandom());

      expect(client['fetchLike']).toBe(mockFetchLike);
      expect(utils.retryFetchLike).toHaveBeenCalledWith(
        utils.defaultFetchLike,
        3
      );
      expect(utils.cachedFetchLike).toHaveBeenCalledWith(mockFetchLike, {
        timeToLive: 5 * 60 * 1000,
      });
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
          .spyOn(utils, 'ethersWalletFromCore')
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
          expectedProtocolDetails,
          expect.anything()
        );

        expect(protocol).toBeInstanceOf(ProtocolClientV1);
        expect(getProtocolDetailsFromSlugSpy).toHaveBeenCalledWith('sokol');
      }
    );

    it('should use the protocolDetailsResolver if set', async () => {
      const mockWallet = {};
      jest
        .spyOn(utils, 'ethersWalletFromCore')
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
        mockProtocolDetails,
        expect.anything()
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
      ).rejects.toThrow(/Failed to fetch protocol details on arianee api/);
    });

    it('should return the correct protocol v1 details', async () => {
      const mockProtocolDetails: ProtocolDetailsV1 = {
        protocolVersion: '1.0',
        chainId: 77,
        httpProvider: 'https://sokol.arianee.net',
        gasStation: 'https://cert.arianee.net/gasStation/testnet.json',
        contractAdresses: {
          aria: '0xB81AFe27c103bcd42f4026CF719AF6D802928765',
          creditHistory: '0x9C868D9bf85CA649f219204D16d99A240cB1F011',
          eventArianee: '0x8e8de8fe625c376f6d4fb2fc351337268a73388b',
          identity: '0x6f5d3ac15576f0da108cde3b7bbbf8f89eb8e7b2',
          smartAsset: '0x512C1FCF401133680f373a386F3f752b98070BC5',
          store: '0x5360DbFF3546b920431A20268D2B5DFf8bF9b4dD',
          lost: '0x6f5d3ac15576f0da108cde3b7bbbf8f89eb8e7b2',
          whitelist: '0x3579669219DC20Aa79E74eEFD5fB2EcB0CE5fE0D',
          message: '0xadD562C6c8D8755E0FaB1c12705831E759b77D00',
          userAction: '0x6bDb54FB6227C360b95F9A08Fb670f8207D3476f',
          updateSmartAssets: '0x3ae108bF0Ee8bB9D810BfC80aC73394ee1509C7b',
        },
        soulbound: false,
      };

      fetchLike.mockResolvedValue({
        ok: true,
        json: async () => mockProtocolDetails,
      });

      await expect(
        client['getProtocolDetailsFromSlug']('testnet')
      ).resolves.toEqual(mockProtocolDetails);
    });

    it('should return the correct protocol v2 details', async () => {
      const mockProtocolDetails: ProtocolDetailsV2 = {
        protocolVersion: '2.0',
        chainId: 77,
        httpProvider: 'https://sokol.arianee.net',
        gasStation: 'https://gasstation.arianee.com/77',
        contractAdresses: {
          nft: '0xab459bf433187B78c66323Bf56e1E59bE1D405b6',
          ownershipRegistry: '0x40b6851Af149C70A7A5b7694dBD76f0A81a3F576',
          eventHub: '0xF45577b9B8a33EC58169c5c0f936F55e095Cf660',
          messageHub: '0x6271B6D8Dc92649e60b96806450D8C49802486Eb',
          rulesManager: '0xeF104AcFEaA0cff8eE9f9c5426bb4a2A818d26D4',
          creditManager: '0x6709a7e7FE038Dc32925Ba5A14704a7eD1e6bD2F',
        },
        nftInterfaces: {
          ERC721: true,
          SmartAsset: true,
          SmartAssetBurnable: true,
          SmartAssetRecoverable: true,
          SmartAssetSoulbound: false,
          SmartAssetUpdatable: true,
          SmartAssetURIStorage: true,
          SmartAssetURIStorageOverridable: false,
        },
      };

      fetchLike.mockResolvedValue({
        ok: true,
        json: async () => mockProtocolDetails,
      });

      await expect(
        client['getProtocolDetailsFromSlug']('77-2.0-test-0')
      ).resolves.toEqual(mockProtocolDetails);
    });
  });
});
