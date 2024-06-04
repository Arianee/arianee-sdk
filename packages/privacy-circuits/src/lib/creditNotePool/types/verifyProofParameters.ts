import { Groth16Proof, PublicSignals } from 'snarkjs';

export type CreditNotePoolVerifyProofParameters = {
  proof: Groth16Proof;
  publicSignals: PublicSignals;
};
