import { ProtocolClientV1 } from '@arianee/arianee-protocol-client';
import { Poseidon } from 'circomlibjs';
import { hashMessage, solidityPackedKeccak256 } from 'ethers';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { groth16 } from 'snarkjs';

import {
  CREDIT_PROOF_SIZE,
  DEFAULT_CREDIT_PROOF,
  DEFAULT_OWNERSHIP_PROOF,
  HEX_FLAG_SIZE,
  OWNERSHIP_PROOF_SIZE,
  OWNERSHIP_VERIFIER_PROVING_KEY_RELATIVE_PATH,
  OWNERSHIP_VERIFIER_VERIFICATION_KEY_RELATIVE_PATH,
  OWNERSHIP_VERIFIER_WASM_RELATIVE_PATH,
  SELECTOR_SIZE,
} from '../constants';
import Prover from '../prover';
import { toHex } from '../utils';
import {
  IssuerProxyComputeCommitmentParameters as ComputeCommitmentParameters,
  IssuerProxyComputeCommitmentResult as ComputeCommitmentResult,
  IssuerProxyComputeIntentParameters as ComputeIntentParameters,
  IssuerProxyComputeIntentResult as ComputeIntentResult,
  IssuerProxyGenerateProofParameters as GenerateProofParameters,
  IssuerProxyGenerateProofResult as GenerateProofResult,
  IssuerProxyVerifyProofParameters as VerifyProofParameters,
  OwnershipProofCallData,
} from './types';

export default class IssuerProxy {
  private readonly poseidon: Poseidon;

  constructor(private readonly prover: Prover) {
    this.poseidon = prover.poseidon;
  }

  public async computeCommitmentHash(
    params: ComputeCommitmentParameters
  ): Promise<ComputeCommitmentResult> {
    const { protocolV1, tokenId } = params;
    this._ensurePrivacySupport(protocolV1);

    const { r, s, v } = await this._getSignature(protocolV1, tokenId);

    const { commitmentHashAsBuff, commitmentHashAsStr, commitmentHashAsHex } =
      this._computeCommitmentHash({ r, s, v });
    return { commitmentHashAsBuff, commitmentHashAsStr, commitmentHashAsHex };
  }

  public async computeIntentHash(
    params: ComputeIntentParameters
  ): Promise<ComputeIntentResult> {
    const { protocolV1, fragment, values, needsCreditNoteProof } = params;
    this._ensurePrivacySupport(protocolV1);

    const intentHashAsStr = this._computeIntentHash(
      protocolV1,
      fragment,
      values,
      needsCreditNoteProof
    );
    return { intentHashAsStr };
  }

  public async generateProof(
    params: GenerateProofParameters
  ): Promise<GenerateProofResult> {
    const { protocolV1, tokenId, intentHashAsStr } = params;
    this._ensurePrivacySupport(protocolV1);

    const { r, s, v } = await this._getSignature(protocolV1, tokenId);
    const { commitmentHashAsStr } = this._computeCommitmentHash({ r, s, v });
    const nonce = this._getNonce();

    const ownershipVerifierWasmPath = resolve(
      this.prover.circuitsBuildPath,
      OWNERSHIP_VERIFIER_WASM_RELATIVE_PATH
    );
    const ownershipVerifierProvingKeyPath = resolve(
      this.prover.circuitsBuildPath,
      OWNERSHIP_VERIFIER_PROVING_KEY_RELATIVE_PATH
    );

    const { proof, publicSignals } = await groth16.fullProve(
      {
        // Private inputs
        sig: [r, s, v],
        // Public inputs
        pubCommitmentHash: commitmentHashAsStr,
        pubIntentHash: intentHashAsStr,
        pubNonce: nonce,
      },
      ownershipVerifierWasmPath,
      ownershipVerifierProvingKeyPath
    );
    const callDataAsStr = await groth16.exportSolidityCallData(
      proof,
      publicSignals
    );
    const callData = JSON.parse(`[${callDataAsStr}]`) as OwnershipProofCallData;

    return { proof, publicSignals, callDataAsStr, callData };
  }

  public async verifyProof(params: VerifyProofParameters): Promise<boolean> {
    const { publicSignals, proof } = params;

    const ownershipVerifierVerificationKeyPath = resolve(
      this.prover.circuitsBuildPath,
      OWNERSHIP_VERIFIER_VERIFICATION_KEY_RELATIVE_PATH
    );
    const ownershipVerifierVerificationKey = JSON.parse(
      readFileSync(ownershipVerifierVerificationKeyPath, 'utf-8')
    );

    const isValid = await groth16.verify(
      ownershipVerifierVerificationKey,
      publicSignals,
      proof
    );
    return isValid;
  }

  private _computeCommitmentHash({
    r,
    s,
    v,
  }: {
    r: string;
    s: string;
    v: number;
  }): {
    commitmentHashAsBuff: Buffer;
    commitmentHashAsStr: string;
    commitmentHashAsHex: string;
  } {
    const commitmentHash = this.poseidon([r, s, v]);
    const commitmentHashAsBuff = Buffer.from(commitmentHash);
    const commitmentHashAsStr = this.poseidon.F.toString(commitmentHash);
    const commitmentHashAsHex = toHex(commitmentHashAsStr);
    return { commitmentHashAsBuff, commitmentHashAsStr, commitmentHashAsHex };
  }

  private _computeIntentHash(
    protocolV1: ProtocolClientV1,
    fragment: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    values: readonly any[],
    needsCreditNoteProof: boolean
  ): string {
    const fnArgs = [DEFAULT_OWNERSHIP_PROOF, ...values];
    if (needsCreditNoteProof) fnArgs.splice(1, 0, DEFAULT_CREDIT_PROOF);

    const intentData =
      protocolV1.arianeeIssuerProxy!.interface.encodeFunctionData(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        fragment as any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        fnArgs as any
      );
    const intentDataPart = intentData
      .slice(0, HEX_FLAG_SIZE + SELECTOR_SIZE)
      .concat(
        intentData.slice(
          HEX_FLAG_SIZE +
            SELECTOR_SIZE +
            OWNERSHIP_PROOF_SIZE +
            (needsCreditNoteProof ? CREDIT_PROOF_SIZE : 0),
          intentData.length
        )
      );
    const intentDataPartPacked = solidityPackedKeccak256(
      ['bytes'],
      [intentDataPart]
    );

    const intentHash: string = this.prover.poseidon.F.toString(
      this.poseidon([intentDataPartPacked])
    );
    return intentHash;
  }

  private async _getSignature(
    protocolV1: ProtocolClientV1,
    tokenId: string
  ): Promise<{ r: string; s: string; v: number }> {
    const chainId = protocolV1.protocolDetails.chainId;
    const smartAssetContractAddress =
      await protocolV1.smartAssetContract.getAddress();
    const message = `${chainId}.${smartAssetContractAddress}.${tokenId}`;

    const digest = hashMessage(message);
    if (!this.prover.core.signDigest) {
      throw new Error('Your `Core` instance does not support `signDigest`');
    }
    const { signature } = await this.prover.core.signDigest(digest);
    return signature;
  }

  private _getNonce() {
    return Math.floor(Math.random() * 1_000_000_000);
  }

  private _ensurePrivacySupport(protocolV1: ProtocolClientV1) {
    if (!protocolV1.isPrivacyEnabled) {
      throw new Error('This protocol does not support privacy');
    }
  }
}
