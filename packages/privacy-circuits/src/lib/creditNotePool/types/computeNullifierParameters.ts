import { ProtocolClientV1 } from '@arianee/arianee-protocol-client';

export type CreditNotePoolComputeNullifierParameters = {
  protocolV1: ProtocolClientV1;
  nullifier: bigint;
  nullifierDerivationIndex: bigint;
};
