import Core from '@arianee/core';
import {
  BabyJub,
  buildBabyjub,
  buildMimcSponge,
  buildPedersenHash,
  buildPoseidon,
  MimcSponge,
  PedersenHash,
  Poseidon,
} from 'circomlibjs';

import CreditNotePool from './creditNotePool/creditNotePool';
import IssuerProxy from './issuerProxy/issuerProxy';

export type ProverParams = {
  core: Core;
  useCreditNotePool?: boolean;
  // TODO: Check if it's really relevant to add a `brandUniqueSalt` to be used in IssuerProxy.computeCommitment()
};

export default class Prover {
  public readonly core: Core;
  public readonly useCreditNotePool: boolean;

  private isInit;

  private _poseidon: Poseidon | null = null;
  public get poseidon(): Poseidon {
    return this._poseidon!;
  }
  private _babyJub: BabyJub | null = null;
  public get babyJub(): BabyJub {
    return this._babyJub!;
  }
  private _pedersenHash: PedersenHash | null = null;
  public get pedersenHash(): PedersenHash {
    return this._pedersenHash!;
  }
  private _mimcSponge: MimcSponge | null = null;
  public get mimcSponge(): MimcSponge {
    return this._mimcSponge!;
  }

  private _issuerProxy: IssuerProxy | null = null;
  public get issuerProxy(): IssuerProxy {
    if (!this.isInit || !this._issuerProxy) {
      throw new Error(
        'You must call `Prover.init` before using `Prover.issuerProxy`'
      );
    }
    return this._issuerProxy;
  }

  private _creditNotePool: CreditNotePool | null = null;
  public get creditNotePool(): CreditNotePool {
    if (!this.useCreditNotePool) {
      throw new Error(
        'You must set `useCreditNotePool` to true in order to use `Prover.creditNotePool`'
      );
    }
    if (!this.isInit || !this._creditNotePool) {
      throw new Error(
        'You must call `Prover.init` before using `Prover.creditNotePool`'
      );
    }
    return this._creditNotePool!;
  }

  constructor(params: ProverParams) {
    const { core, useCreditNotePool } = params;
    this.core = core;
    this.useCreditNotePool = useCreditNotePool || false;

    this.isInit = false;
  }

  public async init() {
    this._poseidon = await buildPoseidon();
    if (this.useCreditNotePool) {
      this._babyJub = await buildBabyjub();
      this._pedersenHash = await buildPedersenHash();
      this._mimcSponge = await buildMimcSponge();
    }

    this._issuerProxy = new IssuerProxy(this);
    this._creditNotePool = this.useCreditNotePool
      ? new CreditNotePool(this)
      : null;

    this.isInit = true;
  }
}

export { Prover };
