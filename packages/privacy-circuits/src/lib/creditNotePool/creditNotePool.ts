import { ProtocolClientV1 } from '@arianee/arianee-protocol-client';
import { BabyJub, MimcSponge, PedersenHash } from 'circomlibjs';
import { assert } from 'console';
import { MerkleTree } from 'fixed-merkle-tree';
import { groth16 } from 'snarkjs';

import {
  CREDIT_VERIFIER_PROVING_KEY_PATH,
  CREDIT_VERIFIER_VERIFICATION_KEY,
  CREDIT_VERIFIER_WASH_PATH,
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
} from './types';
import { CreditNoteProofCallData } from './types/creditNoteProofCallData';

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
      zkCreditType: _zkCreditType,
      issuerProxy: _issuerProxy,
    } = params;
    this._ensurePrivacySupport(protocolV1);

    const nullifier = _nullifier ? _nullifier : randomBigInt(31);
    const secret = _secret ? _secret : randomBigInt(31);
    const zkCreditType = BigInt(_zkCreditType);
    const issuerProxy = BigInt(_issuerProxy);

    const { commitmentHashAsBuff, commitmentHashAsStr, commitmentHashAsHex } =
      this._computeCommitmentHash(nullifier, secret, zkCreditType, issuerProxy);
    return {
      nullifier,
      secret,
      commitmentHashAsBuff,
      commitmentHashAsStr,
      commitmentHashAsHex,
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
      zkCreditType: _zkCreditType,
      issuerProxy: _issuerProxy,
      intentHashAsStr,
      performValidation,
    } = params;
    this._ensurePrivacySupport(protocolV1);

    const zkCreditType = BigInt(_zkCreditType);
    const issuerProxy = BigInt(_issuerProxy);

    const { commitmentHashAsHex } = this._computeCommitmentHash(
      nullifier,
      secret,
      zkCreditType,
      issuerProxy
    );

    const { nullifierHashAsHex, nullifierHashAsStr } =
      this._computeNullifierHash(nullifier, nullifierDerivationIndex);

    const { root, pathElements, pathIndices } = await this._generateMerkleProof(
      protocolV1,
      commitmentHashAsHex,
      nullifierHashAsHex,
      performValidation !== undefined ? performValidation : true
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
        pubCreditType: zkCreditType,
        pubIssuerProxy: issuerProxy,
        pubNullifierHash: nullifierHashAsStr,
        pubIntentHash: intentHashAsStr,
      },
      CREDIT_VERIFIER_WASH_PATH,
      CREDIT_VERIFIER_PROVING_KEY_PATH
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
    const isValid = await groth16.verify(
      CREDIT_VERIFIER_VERIFICATION_KEY,
      publicSignals,
      proof
    );
    return isValid;
  }

  private _computeCommitmentHash(
    nullifier: bigint,
    secret: bigint,
    zkCreditType: bigint,
    issuerProxy: bigint
  ): {
    commitmentHashAsBuff: Buffer;
    commitmentHashAsStr: string;
    commitmentHashAsHex: string;
  } {
    const preimage = Buffer.concat([
      leInt2Buff(nullifier, 31),
      leInt2Buff(secret, 31),
      leInt2Buff(zkCreditType, 1),
      leInt2Buff(issuerProxy, 20),
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
      leafIndex: Number(parsedLog!.args['leafIndex']),
      commitmentHash: parsedLog!.args['commitmentHash'] as string,
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

    if (performValidation) {
      assert(leafIndex >= 0, 'The commitment hash is not found in the tree');

      const isValidRoot = await creditNotePool.isKnownRoot(toHex(tree.root));
      assert(isValidRoot === true, 'Merkle tree is corrupted');

      const isSpent = await creditNotePool.isSpent(nullifierHashAsHex);
      assert(isSpent === false, 'The note is already spent');
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
