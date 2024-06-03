import { ProtocolClientV1 } from '@arianee/arianee-protocol-client';

export type CreditNotePoolComputeCommitmentParameters = {
  protocolV1: ProtocolClientV1;
  nullifier?: bigint;
  secret?: bigint;
  creditType: 1 | 2 | 3 | 4;
  issuerProxy: string;
};
