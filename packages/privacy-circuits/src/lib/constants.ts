import { resolve } from 'path';
import { readFileSync } from 'fs';
import { keccak256, toUtf8Bytes } from 'ethers';
import { Element } from 'fixed-merkle-tree';

export const FIELD_SIZE = BigInt(
  '21888242871839275222246405745257275088548364400416034343698204186575808495617'
);
export const MERKLE_TREE_ZERO_ELEMENT: Element = (
  BigInt(keccak256(toUtf8Bytes('arianee'))) % FIELD_SIZE
).toString();
export const MERKLE_TREE_LEVELS = 30;

export const HEX_FLAG_SIZE = 2; // 0x
const B2H_MUL = 2; // The hex representation of a byte is 2 characters long
export const SELECTOR_SIZE = 4 * B2H_MUL;
export const OWNERSHIP_PROOF_SIZE = 352 * B2H_MUL;
export const CREDIT_PROOF_SIZE = 416 * B2H_MUL;

export const DEFAULT_OWNERSHIP_PROOF = {
  _pA: [BigInt(0), BigInt(0)],
  _pB: [
    [BigInt(0), BigInt(0)],
    [BigInt(0), BigInt(0)],
  ],
  _pC: [BigInt(0), BigInt(0)],
  _pubSignals: [BigInt(0), BigInt(0), BigInt(0)],
};

export const DEFAULT_CREDIT_PROOF = {
  _pA: [BigInt(0), BigInt(0)],
  _pB: [
    [BigInt(0), BigInt(0)],
    [BigInt(0), BigInt(0)],
  ],
  _pC: [BigInt(0), BigInt(0)],
  _pubSignals: [BigInt(0), BigInt(0), BigInt(0), BigInt(0), BigInt(0)],
};

export const OWNERSHIP_VERIFIER_WASH_PATH = resolve(
  __dirname,
  '../../build/ownership_verifier/wasm/ownership_verifier_js/ownership_verifier.wasm'
);
export const OWNERSHIP_VERIFIER_PROVING_KEY_PATH = resolve(
  __dirname,
  '../../build/ownership_verifier/keys/proving_key.zkey'
);
const OWNERSHIP_VERIFIER_VERIFICATION_KEY_PATH = resolve(
  __dirname,
  '../../build/ownership_verifier/keys/verification_key.json'
);
export const OWNERSHIP_VERIFIER_VERIFICATION_KEY = JSON.parse(
  readFileSync(OWNERSHIP_VERIFIER_VERIFICATION_KEY_PATH, 'utf-8')
);

export const CREDIT_VERIFIER_WASH_PATH = resolve(
  __dirname,
  '../../build/credit_verifier/wasm/credit_verifier_js/credit_verifier.wasm'
);
export const CREDIT_VERIFIER_PROVING_KEY_PATH = resolve(
  __dirname,
  '../../build/credit_verifier/keys/proving_key.zkey'
);
const CREDIT_VERIFIER_VERIFICATION_KEY_PATH = resolve(
  __dirname,
  '../../build/credit_verifier/keys/verification_key.json'
);
export const CREDIT_VERIFIER_VERIFICATION_KEY = JSON.parse(
  readFileSync(CREDIT_VERIFIER_VERIFICATION_KEY_PATH, 'utf-8')
);
