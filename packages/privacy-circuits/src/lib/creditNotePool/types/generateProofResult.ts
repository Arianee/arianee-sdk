import { Groth16Proof, PublicSignals } from 'snarkjs';

import { CreditNoteProofCallData } from './creditNoteProofCallData';

export type CreditNotePoolGenerateProofResult = {
  proof: Groth16Proof;
  publicSignals: PublicSignals;
  callDataAsStr: string;
  callData: CreditNoteProofCallData;
};
