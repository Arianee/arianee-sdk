import { Signer } from 'ethers';

import { ProtocolClientBase } from '../shared/protocolClientBase';
import { ProtocolDetailsV2 } from '../shared/types';

export default class ProtocolClientV2 extends ProtocolClientBase<ProtocolDetailsV2> {
  constructor(signer: Signer, protocolDetails: ProtocolDetailsV2) {
    super(signer, protocolDetails);

    const { protocolVersion } = protocolDetails;
  }
}

export { ProtocolClientV2 };
