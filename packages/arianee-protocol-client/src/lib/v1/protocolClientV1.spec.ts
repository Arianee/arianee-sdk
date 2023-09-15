import { Signer } from 'ethers';

import { ProtocolDetailsV1 } from '../shared/types';
import ProtocolClientV1 from './protocolClientV1';

describe('ProtocolClientV1', () => {
  it('should throw if instantiated with an invalid version', () => {
    expect(
      () =>
        new ProtocolClientV1(
          {} as unknown as Signer,
          {
            protocolVersion: '2',
          } as unknown as ProtocolDetailsV1,
          {} as any // gasStation
        )
    ).toThrowError(/not compatible with protocol v2/gi);
  });
});
