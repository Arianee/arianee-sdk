import { ProtocolDetailsV2 } from '@arianee/common-types';
import { Signer } from 'ethers';

import ProtocolClientV2 from './protocolClientV2';

describe('ProtocolClientV2', () => {
  it('should throw if instantiated with an invalid version', () => {
    expect(
      () =>
        new ProtocolClientV2(
          {} as unknown as Signer,
          {
            protocolVersion: '1',
          } as unknown as ProtocolDetailsV2,
          {} as any // gasStation
        )
    ).toThrowError(/not compatible with protocol v1/gi);
  });
});
