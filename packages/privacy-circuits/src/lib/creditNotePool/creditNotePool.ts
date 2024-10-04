import { ProtocolClientV1 } from '@arianee/arianee-protocol-client';
import { BabyJub, MimcSponge, PedersenHash } from 'circomlibjs';
import { MerkleTree } from 'fixed-merkle-tree';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { groth16, Groth16Proof, PublicSignals } from 'snarkjs';

import {
  CREDIT_REGISTER_PROVING_KEY_RELATIVE_PATH,
  CREDIT_REGISTER_WASM_RELATIVE_PATH,
  CREDIT_VERIFIER_PROVING_KEY_RELATIVE_PATH,
  CREDIT_VERIFIER_VERIFICATION_KEY_RELATIVE_PATH,
  CREDIT_VERIFIER_WASM_RELATIVE_PATH,
  MERKLE_TREE_LEVELS,
  MERKLE_TREE_ZERO_ELEMENT,
} from '../constants';
import Prover from '../prover';
import { leInt2Buff, randomBigInt, toHex } from '../utils';
import {
  CreditNotePoolComputeCommitmentParameters as ComputeCommitmentParameters,
  CreditNotePoolComputeCommitmentResult as ComputeCommitmentResult,
  CreditNotePoolComputeNullifierParameters as ComputeNullifierParameters,
  CreditNotePoolComputeNullifierResult as ComputeNullifierResult,
  CreditNotePoolGenerateProofParameters as GenerateProofParameters,
  CreditNotePoolGenerateProofResult as GenerateProofResult,
  CreditNotePoolVerifyProofParameters as VerifyProofParameters,
  CreditNoteProofCallData,
  CreditNoteRegistrationProofCallData,
} from './types';
import { RegistrationProofResult } from './types/registrationProofResult';

export default class CreditNotePool {
  private readonly babyJub: BabyJub;
  private readonly pedersenHash: PedersenHash;
  private readonly mimcSponge: MimcSponge;

  constructor(private readonly prover: Prover) {
    this.babyJub = prover.babyJub;
    this.pedersenHash = prover.pedersenHash;
    this.mimcSponge = prover.mimcSponge;
  }

  public async computeCommitmentHash(
    params: ComputeCommitmentParameters
  ): Promise<ComputeCommitmentResult> {
    const {
      protocolV1,
      nullifier: _nullifier,
      secret: _secret,
      creditType: _creditType,
      withRegistrationProof: _withRegistrationProof,
    } = params;
    this._ensurePrivacySupport(protocolV1);

    const nullifier = _nullifier ? _nullifier : randomBigInt(31);
    const secret = _secret ? _secret : randomBigInt(31);
    const creditType = BigInt(_creditType);

    const { commitmentHashAsBuff, commitmentHashAsStr, commitmentHashAsHex } =
      this._computeCommitmentHash(nullifier, secret, creditType);

    const withRegistrationProof =
      _withRegistrationProof !== undefined ? _withRegistrationProof : true;

    let registrationProofResult: RegistrationProofResult | undefined;
    if (withRegistrationProof) {
      registrationProofResult = await this._generateRegistrationProof(
        nullifier,
        secret,
        commitmentHashAsStr,
        creditType
      );
    }

    return {
      nullifier,
      secret,
      commitmentHashAsBuff,
      commitmentHashAsStr,
      commitmentHashAsHex,
      registrationProofResult,
    };
  }

  // NOTE: This will probably be removed in the next iteration
  public async computeNullifierHash(
    params: ComputeNullifierParameters
  ): Promise<ComputeNullifierResult> {
    const { protocolV1, nullifier, nullifierDerivationIndex } = params;
    this._ensurePrivacySupport(protocolV1);

    const { nullifierHashAsBuff, nullifierHashAsStr, nullifierHashAsHex } =
      this._computeNullifierHash(nullifier, nullifierDerivationIndex);
    return { nullifierHashAsBuff, nullifierHashAsStr, nullifierHashAsHex };
  }

  public async generateProof(
    params: GenerateProofParameters
  ): Promise<GenerateProofResult> {
    const {
      protocolV1,
      nullifier,
      nullifierDerivationIndex,
      secret,
      creditType: _creditType,
      intentHashAsStr,
      performValidation,
    } = params;
    this._ensurePrivacySupport(protocolV1);

    const creditType = BigInt(_creditType);

    const { commitmentHashAsHex } = this._computeCommitmentHash(
      nullifier,
      secret,
      creditType
    );

    const { nullifierHashAsHex, nullifierHashAsStr } =
      this._computeNullifierHash(nullifier, nullifierDerivationIndex);

    const { root, pathElements, pathIndices } = await this._generateMerkleProof(
      protocolV1,
      commitmentHashAsHex,
      nullifierHashAsHex,
      performValidation !== undefined ? performValidation : true
    );

    const creditVerifierWasmPath = resolve(
      this.prover.circuitsBuildPath,
      CREDIT_VERIFIER_WASM_RELATIVE_PATH
    );
    const creditVerifierProvingKeyPath = resolve(
      this.prover.circuitsBuildPath,
      CREDIT_VERIFIER_PROVING_KEY_RELATIVE_PATH
    );

    const { proof, publicSignals } = await groth16.fullProve(
      {
        // Private inputs
        nullifier,
        nullifierDerivationIndex,
        secret,
        pathElements,
        pathIndices,
        // Public inputs
        pubRoot: root,
        pubCreditType: creditType,
        pubNullifierHash: nullifierHashAsStr,
        pubIntentHash: intentHashAsStr,
      },
      creditVerifierWasmPath,
      creditVerifierProvingKeyPath
    );
    const callDataAsStr = await groth16.exportSolidityCallData(
      proof,
      publicSignals
    );
    const callData = JSON.parse(
      `[${callDataAsStr}]`
    ) as CreditNoteProofCallData;

    return { proof, publicSignals, callDataAsStr, callData };
  }

  public async verifyProof(params: VerifyProofParameters): Promise<boolean> {
    const { publicSignals, proof } = params;

    const creditVerifierVerificationKeyPath = resolve(
      this.prover.circuitsBuildPath,
      CREDIT_VERIFIER_VERIFICATION_KEY_RELATIVE_PATH
    );
    const creditVerifierVerificationKey = JSON.parse(
      readFileSync(creditVerifierVerificationKeyPath, 'utf-8')
    );

    const isValid = await groth16.verify(
      creditVerifierVerificationKey,
      publicSignals,
      proof
    );
    return isValid;
  }

  private async _generateRegistrationProof(
    nullifier: bigint,
    secret: bigint,
    commitmentHashAsStr: string,
    creditType: bigint
  ): Promise<{
    proof: Groth16Proof;
    publicSignals: PublicSignals;
    callDataAsStr: string;
    callData: CreditNoteRegistrationProofCallData;
  }> {
    const creditRegisterWasmPath = resolve(
      this.prover.circuitsBuildPath,
      CREDIT_REGISTER_WASM_RELATIVE_PATH
    );
    const creditRegisterProvingKeyPath = resolve(
      this.prover.circuitsBuildPath,
      CREDIT_REGISTER_PROVING_KEY_RELATIVE_PATH
    );

    const { proof, publicSignals } = await groth16.fullProve(
      {
        // Private inputs
        nullifier,
        secret,
        // Public inputs
        pubCommitmentHash: commitmentHashAsStr,
        pubCreditType: creditType,
      },
      creditRegisterWasmPath,
      creditRegisterProvingKeyPath
    );
    const callDataAsStr = await groth16.exportSolidityCallData(
      proof,
      publicSignals
    );
    const callData = JSON.parse(
      `[${callDataAsStr}]`
    ) as CreditNoteRegistrationProofCallData;

    return { proof, publicSignals, callDataAsStr, callData };
  }

  private _computeCommitmentHash(
    nullifier: bigint,
    secret: bigint,
    creditType: bigint
  ): {
    commitmentHashAsBuff: Buffer;
    commitmentHashAsStr: string;
    commitmentHashAsHex: string;
  } {
    const preimage = Buffer.concat([
      leInt2Buff(nullifier, 31),
      leInt2Buff(secret, 31),
      leInt2Buff(creditType, 1),
    ]);

    const commitmentHash = this.babyJub.unpackPoint(
      this.pedersenHash.hash(preimage)
    )[0];
    const commitmentHashAsBuff = Buffer.from(commitmentHash);
    const commitmentHashAsStr = this.babyJub.F.toString(commitmentHash);
    const commitmentHashAsHex = toHex(commitmentHashAsStr);
    return { commitmentHashAsBuff, commitmentHashAsStr, commitmentHashAsHex };
  }

  private _computeNullifierHash(
    nullifier: bigint,
    nullifierDerivationIndex: bigint
  ): {
    nullifierHashAsBuff: Buffer;
    nullifierHashAsStr: string;
    nullifierHashAsHex: string;
  } {
    const preimage = Buffer.concat([
      leInt2Buff(nullifier, 31),
      leInt2Buff(nullifierDerivationIndex, 2),
    ]);

    const nullifierHash = this.babyJub.unpackPoint(
      this.pedersenHash.hash(preimage)
    )[0];
    const nullifierHashAsBuff = Buffer.from(nullifierHash);
    const nullifierHashAsStr = this.babyJub.F.toString(nullifierHash);
    const nullifierHashAsHex = toHex(nullifierHashAsStr);
    return { nullifierHashAsBuff, nullifierHashAsStr, nullifierHashAsHex };
  }

  private async _generateMerkleProof(
    protocolV1: ProtocolClientV1,
    commitmentHashAsHex: string,
    nullifierHashAsHex: string,
    performValidation: boolean
  ) {
    const creditNotePool = protocolV1.arianeeCreditNotePool!;
    const creditNotePoolAddress = await creditNotePool.getAddress();
    const purchasedTopic = await creditNotePool.filters
      .Purchased()
      .getTopicFilter();

    const logs = await protocolV1.provider.getLogs({
      fromBlock: 0,
      toBlock: 'latest',
      address: creditNotePoolAddress,
      topics: purchasedTopic,
    });

    const parsedLogs = logs.map((log) =>
      creditNotePool.interface.parseLog(
        log as unknown as { data: string; topics: string[] }
      )
    );

    const formattedLogs = parsedLogs.map((parsedLog) => ({
      leafIndex: Number(parsedLog!.args['_leafIndex']),
      commitmentHash: parsedLog!.args['_commitmentHash'] as string,
    }));

    const leaves = formattedLogs.map((log) => log.commitmentHash);
    const tree = new MerkleTree(MERKLE_TREE_LEVELS, leaves, {
      zeroElement: MERKLE_TREE_ZERO_ELEMENT,
      hashFunction: (left, right) =>
        this.mimcSponge.F.toString(this.mimcSponge.multiHash([left, right])),
    });

    const leaf = formattedLogs.find(
      (log) => log.commitmentHash === commitmentHashAsHex
    );

    const leafIndex = leaf ? leaf.leafIndex : -1;
    if (leafIndex < 0)
      throw new Error('The commitment hash is not found in the tree');

    if (performValidation) {
      const isValidRoot = await creditNotePool.isKnownRoot(toHex(tree.root));
      if (!isValidRoot) throw new Error('Merkle tree is corrupted');

      const isSpent = await creditNotePool.isSpent(nullifierHashAsHex);
      if (isSpent) throw new Error('The note is already spent');
    }

    const { pathElements, pathIndices } = tree.path(leafIndex);
    return { pathElements, pathIndices, root: tree.root };
  }

  private _ensurePrivacySupport(protocolV1: ProtocolClientV1) {
    if (!protocolV1.isPrivacyEnabled) {
      throw new Error('This protocol does not support privacy');
    }
  }
}
