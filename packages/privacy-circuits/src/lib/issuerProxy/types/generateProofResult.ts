import { Groth16Proof, PublicSignals } from 'snarkjs';

export type IssuerProxyGenerateProofResult = {
  proof: Groth16Proof;
  publicSignals: PublicSignals;
  callData: string;
};
