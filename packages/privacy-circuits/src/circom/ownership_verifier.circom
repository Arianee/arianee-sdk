pragma circom 2.1.8;

include "../../node_modules/circomlib/circuits/poseidon.circom";

template OwnershipVerifier() {
    // Private inputs
    signal input sig[3];

    // Public inputs
    signal input pubCommitmentHash;
    signal input pubIntentHash;
    signal input pubNonce;

    component commitmentHasher = Poseidon(3);
    commitmentHasher.inputs[0] <== sig[0];
    commitmentHasher.inputs[1] <== sig[1];
    commitmentHasher.inputs[2] <== sig[2];

    // TODO: Remove this once ready to release
    log("PubHash input is", pubCommitmentHash);
    log("CommitmentHasher output is", commitmentHasher.out);

    commitmentHasher.out === pubCommitmentHash;

    // Dummy squares to prevent tampering pubIntentHashSquared and pubNonceSquared values
    signal pubIntentHashSquared;
    signal pubNonceSquared;

    pubIntentHashSquared <== pubIntentHash * pubIntentHash;
    pubNonceSquared <== pubNonce * pubNonce;
}

component main { public [pubCommitmentHash, pubIntentHash, pubNonce] } = OwnershipVerifier();