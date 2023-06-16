import { Signer } from 'ethers';
import ProtocolClientV1 from './protocolClientV1';
import { ProtocolDetails } from '../shared/types';

describe('ProtocolClientV1', () => {
  it('should throw if instantiated with an invalid version', () => {
    expect(
      () =>
        new ProtocolClientV1(
          {} as unknown as Signer,
          {
            version: '2',
          } as unknown as ProtocolDetails
        )
    ).toThrowError(/not compatible with protocol v2/gi);
  });
});
