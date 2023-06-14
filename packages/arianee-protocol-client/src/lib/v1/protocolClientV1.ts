import { BaseWallet, Signer, Wallet } from 'ethers';
import { ProtocolDetails } from '../shared/types';

// TODO in another PR

export default class ProtocolClientV1 {
  constructor(
    private signer: Signer,
    private protocolDetails: ProtocolDetails
  ) {}
}
