import { ProtocolClientV1 } from '@arianee/arianee-protocol-client';

export type CreditNotePoolGenerateProofParameters = {
  protocolV1: ProtocolClientV1;
  nullifier: bigint;
  nullifierDerivationIndex: bigint;
  secret: bigint;
  creditType: 0 | 1 | 2 | 3;
  intentHashAsStr: string;
  performValidation?: boolean;
};
