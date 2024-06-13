pragma circom 2.1.8;

include "../../node_modules/circomlib/circuits/bitify.circom";
include "../../node_modules/circomlib/circuits/pedersen.circom";

template NullifierHasher() {
    signal input nullifier;
    signal input nullifierDerivationIndex;

    signal output nullifierHash;
    
    component nullifierHasher = Pedersen(264); // 248 (nullifier) + 16 (nullifierDerivationIndex)

    component nullifierBits = Num2Bits(248);
    component nullifierDerivationIndexBits = Num2Bits(16);
    nullifierBits.in <== nullifier;
    nullifierDerivationIndexBits.in <== nullifierDerivationIndex;

    for (var i = 0; i < 248; i++) {
        nullifierHasher.in[i] <== nullifierBits.out[i];
    }
    for (var i = 248; i < 264; i++) {
        nullifierHasher.in[i] <== nullifierDerivationIndexBits.out[i - 248];
    }

    nullifierHash <== nullifierHasher.out[0];
}
