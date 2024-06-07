import { Groth16Proof, PublicSignals } from 'snarkjs';
import { OwnershipProofCallData } from './ownershipProofCallData';

export type IssuerProxyGenerateProofResult = {
  proof: Groth16Proof;
  publicSignals: PublicSignals;
  callDataAsStr: string;
  callData: OwnershipProofCallData;
};
