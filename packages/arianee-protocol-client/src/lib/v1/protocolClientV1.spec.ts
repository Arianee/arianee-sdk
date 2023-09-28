import { Signer } from 'ethers';

import ProtocolClientV1 from './protocolClientV1';
import { ProtocolDetailsV1 } from '@arianee/common-types';

describe('ProtocolClientV1', () => {
  it('should throw if instantiated with an invalid version', () => {
    expect(
      () =>
        new ProtocolClientV1(
          {} as unknown as Signer,
          {
            protocolVersion: '2.0',
          } as unknown as ProtocolDetailsV1,
          {} as any // gasStation
        )
    ).toThrowError(/not compatible with protocol v2/gi);
  });
});
