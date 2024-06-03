import { Groth16Proof, PublicSignals } from 'snarkjs';

export type IssuerProxyVerifyProofParameters = {
  proof: Groth16Proof;
  publicSignals: PublicSignals;
};
