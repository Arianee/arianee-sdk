pragma circom 2.1.8;

include "../../node_modules/circomlib/circuits/bitify.circom";
include "../../node_modules/circomlib/circuits/pedersen.circom";

template CommitmentHasher() {
    signal input nullifier;
    signal input secret;
    signal input creditType;

    signal output commitment;
    
    component commitmentHasher = Pedersen(504); // 248 (nullifier) + 248 (secret) + 8 (creditType)

    component nullifierBits = Num2Bits(248);
    component secretBits = Num2Bits(248); 
    component creditTypeBits = Num2Bits(8);
    nullifierBits.in <== nullifier;
    secretBits.in <== secret;
    creditTypeBits.in <== creditType;

    for (var i = 0; i < 248; i++) {
        commitmentHasher.in[i] <== nullifierBits.out[i];
    }
    for (var i = 248; i < 496; i++) {
        commitmentHasher.in[i] <== secretBits.out[i - 248];
    }
    for (var i = 496; i < 504; i++) {
        commitmentHasher.in[i] <== creditTypeBits.out[i - 496];
    }

    commitment <== commitmentHasher.out[0];
}
