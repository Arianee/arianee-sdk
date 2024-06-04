import { ProtocolClientV1 } from '@arianee/arianee-protocol-client';

export type CreditNotePoolGenerateProofParameters = {
  protocolV1: ProtocolClientV1;
  nullifier: bigint;
  nullifierDerivationIndex: bigint;
  secret: bigint;
  creditType: 1 | 2 | 3 | 4;
  issuerProxy: string;
  intentHashAsStr: string;
  performValidation?: boolean;
};
