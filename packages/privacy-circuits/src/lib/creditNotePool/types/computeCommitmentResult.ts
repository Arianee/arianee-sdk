export type CreditNotePoolComputeCommitmentResult = {
  nullifier: bigint;
  secret: bigint;
  commitmentHashAsBuff: Buffer;
  commitmentHashAsStr: string;
  commitmentHashAsHex: string;
};