import { Groth16Proof, PublicSignals } from 'snarkjs';
import { CreditNoteRegistrationProofCallData } from './creditNoteRegistrationProofCallData';

export type RegistrationProofResult = {
  proof: Groth16Proof;
  publicSignals: PublicSignals;
  callDataAsStr: string;
  callData: CreditNoteRegistrationProofCallData;
};
