pragma circom 2.1.8;

include "../../node_modules/circomlib/circuits/comparators.circom";
include "../../node_modules/circomlib/circuits/bitify.circom";
include "../../node_modules/circomlib/circuits/pedersen.circom";
include "merkle_tree.circom";

template CommitmentHasher() {
    signal input nullifier;
    signal input nullifierDerivationIndex;
    signal input secret;
    signal input creditType;

    signal output commitment;
    signal output nullifierHash;
    
    component commitmentHasher = Pedersen(504); // 248 (nullifier) + 248 (secret) + 8 (creditType)
    component nullifierHasher = Pedersen(264); // 248 (nullifier) + 16 (nullifierDerivationIndex)

    component nullifierBits = Num2Bits(248);
    component nullifierDerivationIndexBits = Num2Bits(16);
    component secretBits = Num2Bits(248); 
    component creditTypeBits = Num2Bits(8);
    nullifierBits.in <== nullifier;
    nullifierDerivationIndexBits.in <== nullifierDerivationIndex;
    secretBits.in <== secret;
    creditTypeBits.in <== creditType;

    for (var i = 0; i < 248; i++) {
        commitmentHasher.in[i] <== nullifierBits.out[i];
        nullifierHasher.in[i] <== nullifierBits.out[i];
    }
    for (var i = 248; i < 264; i++) {
        nullifierHasher.in[i] <== nullifierDerivationIndexBits.out[i - 248];
    }
    for (var i = 248; i < 496; i++) {
        commitmentHasher.in[i] <== secretBits.out[i - 248];
    }
    for (var i = 496; i < 504; i++) {
        commitmentHasher.in[i] <== creditTypeBits.out[i - 496];
    }

    commitment <== commitmentHasher.out[0];
    nullifierHash <== nullifierHasher.out[0];
}

// Verifies that commitment that corresponds to given secret and nullifier is included in the merkle tree of deposits
template CreditVerifier(levels) {
    // Private inputs
    signal input nullifier;
    signal input nullifierDerivationIndex;
    signal input secret;
    signal input pathElements[levels];
    signal input pathIndices[levels];

    // Public inputs
    signal input creditType;
    signal input root;
    signal input nullifierHash;

    // Ensure that nullifierDerivationIndex is in range 1-1000
    component nulDerIdxGeqt = GreaterEqThan(16);
    nulDerIdxGeqt.in[0] <== nullifierDerivationIndex;
    nulDerIdxGeqt.in[1] <== 1;
    nulDerIdxGeqt.out === 1;

    component nulDerIdxLeqt = LessEqThan(16);
    nulDerIdxLeqt.in[0] <== nullifierDerivationIndex;
    nulDerIdxLeqt.in[1] <== 1000;
    nulDerIdxLeqt.out === 1;

    // Ensure that creditType is in range 1-4
    component creTypGeqt = GreaterEqThan(8);
    creTypGeqt.in[0] <== creditType;
    creTypGeqt.in[1] <== 1;
    creTypGeqt.out === 1;

    component creTypLeqt = LessEqThan(8);
    creTypLeqt.in[0] <== creditType;
    creTypLeqt.in[1] <== 4;
    creTypLeqt.out === 1;

    // Output nullifierHash and commitment
    // nullifierHash = H(nullifier, nullifierDerivationIndex), where nullifierDerivationIndex is 1-1000, allowing for 1000 different nullifierHashes per nullifier
    // commitment = H(nullifier, secret, creditType), where creditType is 1-4, creditType is public
    component hasher = CommitmentHasher();
    hasher.nullifier <== nullifier;
    hasher.nullifierDerivationIndex <== nullifierDerivationIndex;
    hasher.secret <== secret;
    hasher.creditType <== creditType;

    // TODO: Remove this once tested with the proving sdk
    log("");
    log("NullifierHash input is", nullifierHash);
    log("NullifierHasher output is", hasher.nullifierHash);

    log("");
    log("CommitmentHasher output is", hasher.commitment);

    hasher.nullifierHash === nullifierHash;

    component tree = MerkleTreeChecker(levels);
    tree.leaf <== hasher.commitment;
    tree.root <== root;
    for (var i = 0; i < levels; i++) {
        tree.pathElements[i] <== pathElements[i];
        tree.pathIndices[i] <== pathIndices[i];
    }
}

component main { public [creditType, root, nullifierHash] } = CreditVerifier(31);

// N = 2^31 = 2 147 483 648
// C = N * 1000 = 2 147 483 648 000

// U = 20 000
// D = U * 15 = 300 000
// M = D * 30 = 9 000 000
// Y = M * 12 = 108 000 000

// R = C / Y = 19.9