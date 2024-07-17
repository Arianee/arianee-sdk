pragma circom 2.1.8;

include "../../node_modules/circomlib/circuits/comparators.circom";
include "../../node_modules/circomlib/circuits/bitify.circom";
include "../../node_modules/circomlib/circuits/pedersen.circom";
include "commitmentHasher.circom";
include "nullifierHasher.circom";
include "merkleTree.circom";

// Verifies that commitment corresponds to H(nullifier, secret, pubCreditType) and nullifier is included in the merkle tree of deposits
template CreditVerifier(levels, zeroLeafCommitment) {
    // Private inputs
    signal input nullifier;
    signal input nullifierDerivationIndex;
    signal input secret;
    signal input pathElements[levels];
    signal input pathIndices[levels];

    // Public inputs
    signal input pubRoot;
    signal input pubCreditType;
    signal input pubNullifierHash;
    signal input pubIntentHash;

    // Ensure that nullifierDerivationIndex is in range 1-1000
    // One nullifier can have up to 1000 different nullifierHashes
    // In others words, one CreditNote can be spent up to 1000 times
    component nulDerIdxGeqt = GreaterEqThan(16);
    nulDerIdxGeqt.in[0] <== nullifierDerivationIndex;
    nulDerIdxGeqt.in[1] <== 1;
    nulDerIdxGeqt.out === 1;

    component nulDerIdxLeqt = LessEqThan(16);
    nulDerIdxLeqt.in[0] <== nullifierDerivationIndex;
    nulDerIdxLeqt.in[1] <== 1000;
    nulDerIdxLeqt.out === 1;

    // Ensure that pubCreditType is in range [0, 3]
    component creTypLeqt = LessEqThan(8);
    creTypLeqt.in[0] <== pubCreditType;
    creTypLeqt.in[1] <== 3;
    creTypLeqt.out === 1;

    // Output pubNullifierHash and commitment
    // pubNullifierHash = H(nullifier, nullifierDerivationIndex), where nullifierDerivationIndex is 1-1000, allowing for 1000 different nullifierHashes per nullifier
    // commitment = H(nullifier, secret, pubCreditType), where pubCreditType is 0-3, pubCreditType is public
    component commitmentHasher = CommitmentHasher();
    commitmentHasher.nullifier <== nullifier;
    commitmentHasher.secret <== secret;
    commitmentHasher.creditType <== pubCreditType;

    // Assert that commitment is not zeroLeafCommitment
    component equalZeroLeaf = IsEqual();
    equalZeroLeaf.in[0] <== commitmentHasher.commitment;
    equalZeroLeaf.in[1] <== zeroLeafCommitment;
    equalZeroLeaf.out === 0;

    component nullifierHasher = NullifierHasher();
    nullifierHasher.nullifier <== nullifier;
    nullifierHasher.nullifierDerivationIndex <== nullifierDerivationIndex;

    nullifierHasher.nullifierHash === pubNullifierHash;

    // TODO: Remove this once ready to release
    log("");
    log("CommitmentHasher output is", commitmentHasher.commitment);

    log("");
    log("NullifierHash input is", pubNullifierHash);
    log("NullifierHasher output is", nullifierHasher.nullifierHash);

    component tree = MerkleTreeChecker(levels);
    tree.leaf <== commitmentHasher.commitment;
    tree.root <== pubRoot;
    for (var i = 0; i < levels; i++) {
        tree.pathElements[i] <== pathElements[i];
        tree.pathIndices[i] <== pathIndices[i];
    }

    // Dummy square to prevent tampering pubIntentHashSquared
    signal pubIntentHashSquared;

    pubIntentHashSquared <== pubIntentHash * pubIntentHash;
}

component main { public [pubRoot, pubCreditType, pubNullifierHash, pubIntentHash] } = CreditVerifier(30, 1091521254540046781950077156238538356348959033991108648556163547643491462897);

// N = 2^30 = 1 073 741 824
// C = N * 1000 = 1 073 741 824 000

// U (Average Daily Mint Vol.) = 20 000
// D (Average Daily Mint Vol. x 15) = 300 000
// M (Average Monthly Mint Vol.) = 9 000 000
// Y (Average Yearly Mint Vol.) = 108 000 000

// R (Average Yearly CreditNotePool Lifespan) = C / Y = 19.9