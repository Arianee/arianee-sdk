import {
  ProtocolDetailsV2,
  ProtocolV2NftInterface,
} from '@arianee/common-types';

import { CheckV2NftInterfaceError } from '../../../errors';
import ProtocolClientV2 from '../../protocolClientV2';
import { checkV2NftInterface } from './checkV2NftInterface';

describe('checkV2NftInterface', () => {
  const mockSigner = jest.fn();
  const protocolDetailsV2NoInterface: ProtocolDetailsV2 = {
    httpProvider: 'https://mock.com',
    gasStation: 'https://mock.com',
    chainId: 1234,
    contractAdresses: {
      nft: '0x0000000000000000000000000000000000000000',
      ownershipRegistry: '0x0000000000000000000000000000000000000000',
      rulesManager: '0x0000000000000000000000000000000000000000',
      eventHub: '0x0000000000000000000000000000000000000000',
      messageHub: '0x0000000000000000000000000000000000000000',
      creditManager: '0x0000000000000000000000000000000000000000',
    },
    nftInterfaces: {
      ERC721: false,
      SmartAsset: false,
      SmartAssetBurnable: false,
      SmartAssetRecoverable: false,
      SmartAssetSoulbound: false,
      SmartAssetUpdatable: false,
      SmartAssetURIStorage: false,
      SmartAssetURIStorageOverridable: false,
    },
    protocolVersion: '2.0',
  };

  const protocolClientV2NoInterface: ProtocolClientV2 = new ProtocolClientV2(
    mockSigner as any,
    protocolDetailsV2NoInterface,
    {} as any
  );

  const protocolClientV2AllInterfaces: ProtocolClientV2 = new ProtocolClientV2(
    mockSigner as any,
    {
      ...protocolDetailsV2NoInterface,
      nftInterfaces: {
        ERC721: true,
        SmartAsset: true,
        SmartAssetBurnable: true,
        SmartAssetRecoverable: true,
        SmartAssetSoulbound: true,
        SmartAssetUpdatable: true,
        SmartAssetURIStorage: true,
        SmartAssetURIStorageOverridable: true,
      },
    },
    {} as any
  );

  const protocolV2NftInterfaces: Array<{
    nftInterface: ProtocolV2NftInterface;
  }> = [
    {
      nftInterface: 'ERC721',
    },
    {
      nftInterface: 'SmartAsset',
    },
    {
      nftInterface: 'SmartAssetBurnable',
    },
    {
      nftInterface: 'SmartAssetRecoverable',
    },
    {
      nftInterface: 'SmartAssetSoulbound',
    },
    {
      nftInterface: 'SmartAssetUpdatable',
    },
    {
      nftInterface: 'SmartAssetURIStorage',
    },
    {
      nftInterface: 'SmartAssetURIStorageOverridable',
    },
  ];

  it.each(protocolV2NftInterfaces)(
    'should throw if the requested interface ($interface) is not available with `throwIfNeedNotSatisfied` set to true',
    ({ nftInterface }) => {
      expect(() =>
        checkV2NftInterface({
          nftInterface,
          protocolClientV2: protocolClientV2NoInterface,
          need: 'Implemented',
        })
      ).toThrow(
        /Interface ".*" is not implemented on the nft contract of this protocol/gi
      );

      expect(() =>
        checkV2NftInterface({
          nftInterface,
          protocolClientV2: protocolClientV2NoInterface,
          need: 'Implemented',
        })
      ).toThrow(CheckV2NftInterfaceError);
    }
  );

  it('should throw if the protocol details is malformed', () => {
    const malformedProtocolDetails = {
      ...protocolDetailsV2NoInterface,
    };

    delete (malformedProtocolDetails as any).nftInterfaces;

    const protocolClientV2Malformed = new ProtocolClientV2(
      mockSigner as any,
      malformedProtocolDetails,
      {} as any // gasStation
    );

    expect(() =>
      checkV2NftInterface({
        nftInterface: 'SmartAssetBurnable',
        protocolClientV2: protocolClientV2Malformed,
        need: 'Implemented',
      })
    ).toThrow(/Malformed protocol details/gi);
  });

  it.each(protocolV2NftInterfaces)(
    'should not throw if the requested interface ($nftInterface) is available with `throwIfNeedNotSatisfied` set to false',
    ({ nftInterface }) => {
      expect(
        checkV2NftInterface({
          nftInterface,
          protocolClientV2: protocolClientV2AllInterfaces,
          need: 'Implemented',
          throwIfNeedNotSatisfied: false,
        })
      ).toBe(true);
    }
  );

  it.each(protocolV2NftInterfaces)(
    'should not throw but return false if the requested interface ($interface) is not available with `throwIfNeedNotSatisfied` set to false',
    ({ nftInterface }) => {
      expect(
        checkV2NftInterface({
          nftInterface,
          protocolClientV2: protocolClientV2NoInterface,
          need: 'Implemented',
          throwIfNeedNotSatisfied: false,
        })
      ).toBe(false);
    }
  );
});
