pragma circom 2.1.8;

include "../../node_modules/circomlib/circuits/comparators.circom";
include "../../node_modules/circomlib/circuits/bitify.circom";
include "../../node_modules/circomlib/circuits/pedersen.circom";
include "commitmentHasher.circom";

// Verifies that commitment corresponds to H(nullifier, secret, pubCreditType) and exposes the pubCreditType for on-chain verification
// This circuit does not verify that the nullifier is included in the merkle tree of deposits
template CreditRegister() {
    // Private inputs
    signal input nullifier;
    signal input secret;

    // Public inputs
    signal input pubCommitmentHash;
    signal input pubCreditType;

    // Ensure that pubCreditType is in range [0, 3]
    component creTypLeqt = LessEqThan(8);
    creTypLeqt.in[0] <== pubCreditType;
    creTypLeqt.in[1] <== 3;
    creTypLeqt.out === 1;

    // Output commitment
    // commitment = H(nullifier, secret, pubCreditType), where pubCreditType is 0-3, pubCreditType is public
    component commitmentHasher = CommitmentHasher();
    commitmentHasher.nullifier <== nullifier;
    commitmentHasher.secret <== secret;
    commitmentHasher.creditType <== pubCreditType;

    // TODO: Remove this once ready to release
    // log("");
    // log("CommitmentHash input is", pubCommitmentHash);
    // log("CommitmentHasher output is", commitmentHasher.commitment);

    commitmentHasher.commitment === pubCommitmentHash;
}

component main { public [pubCommitmentHash, pubCreditType] } = CreditRegister();
