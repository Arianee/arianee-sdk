import { UnavailableFeatureError } from '../../../errors';
import { ProtocolDetailsV2, ProtocolV2Feature } from '../../../shared/types';
import ProtocolClientV2 from '../../protocolClientV2';
import { requiresV2Feature } from './requiresV2Feature';

describe('requiresV2Feature', () => {
  const mockSigner = jest.fn();
  const protocolDetailsV2NoFeatures: ProtocolDetailsV2 = {
    httpProvider: 'https://mock.com',
    gasStation: 'https://mock.com',
    chainId: 1234,
    contractAdresses: {
      nft: '0x0000000000000000000000000000000000000000',
      ownership: '0x0000000000000000000000000000000000000000',
      rulesManager: '0x0000000000000000000000000000000000000000',
      event: '0x0000000000000000000000000000000000000000',
      message: '0x0000000000000000000000000000000000000000',
      credit: '0x0000000000000000000000000000000000000000',
    },
    collectionFeatures: {
      burnable: false,
      recoverable: false,
      uriUpdatable: false,
      imprintUpdatable: false,
      transferable: false,
    },
    protocolVersion: '2',
  };

  const protocolClientV2NoFeatures: ProtocolClientV2 = new ProtocolClientV2(
    mockSigner as any,
    protocolDetailsV2NoFeatures,
    {} as any
  );

  const protocolClientV2AllFeatures: ProtocolClientV2 = new ProtocolClientV2(
    mockSigner as any,
    {
      ...protocolDetailsV2NoFeatures,
      collectionFeatures: {
        burnable: true,
        recoverable: true,
        uriUpdatable: true,
        imprintUpdatable: true,
        transferable: true,
      },
    },
    {} as any
  );

  it.each([
    {
      feature: ProtocolV2Feature.burnable,
    },
    {
      feature: ProtocolV2Feature.imprintUpdatable,
    },
    {
      feature: ProtocolV2Feature.recoverable,
    },
    {
      feature: ProtocolV2Feature.transferable,
    },
    {
      feature: ProtocolV2Feature.uriUpdatable,
    },
    {
      feature: 'inexistentFeature' as ProtocolV2Feature,
    },
  ])(
    'should throw if the requested feature ($feature) is not available',
    ({ feature }) => {
      expect(() =>
        requiresV2Feature(feature, protocolClientV2NoFeatures)
      ).toThrow(/Feature ".*" is not available on this protocol/gi);

      expect(() =>
        requiresV2Feature(feature, protocolClientV2NoFeatures)
      ).toThrow(UnavailableFeatureError);
    }
  );

  it('should throw if the protocol details is malformed', () => {
    const malformedProtocolDetails = {
      ...protocolDetailsV2NoFeatures,
    };

    delete (malformedProtocolDetails as any).collectionFeatures;

    const protocolClientV2Malformed = new ProtocolClientV2(
      mockSigner as any,
      malformedProtocolDetails as any,
      {} as any // gasStation
    );

    expect(() =>
      requiresV2Feature(ProtocolV2Feature.burnable, protocolClientV2Malformed)
    ).toThrow(/Malformed protocol details/gi);
  });

  it.each([
    {
      feature: ProtocolV2Feature.burnable,
    },
    {
      feature: ProtocolV2Feature.imprintUpdatable,
    },
    {
      feature: ProtocolV2Feature.recoverable,
    },
    {
      feature: ProtocolV2Feature.transferable,
    },
    {
      feature: ProtocolV2Feature.uriUpdatable,
    },
  ])(
    'should not throw if the requested feature ($feature) is available',
    ({ feature }) => {
      expect(() =>
        requiresV2Feature(feature, protocolClientV2AllFeatures)
      ).not.toThrow();
    }
  );
});
