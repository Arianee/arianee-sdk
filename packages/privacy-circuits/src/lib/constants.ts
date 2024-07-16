import {
  ArianeeCreditNotePool,
  ArianeeIssuerProxy,
} from '@arianee/arianee-abi/dist/ethers6/v1_1';
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
export const CREDIT_PROOF_SIZE = 384 * B2H_MUL;

export const DEFAULT_OWNERSHIP_PROOF: ArianeeIssuerProxy.OwnershipProofStruct =
  {
    _pA: [BigInt(0), BigInt(0)],
    _pB: [
      [BigInt(0), BigInt(0)],
      [BigInt(0), BigInt(0)],
    ],
    _pC: [BigInt(0), BigInt(0)],
    _pubSignals: [BigInt(0), BigInt(0), BigInt(0)],
  };

export const DEFAULT_CREDIT_PROOF: ArianeeCreditNotePool.CreditNoteProofStruct =
  {
    _pA: [BigInt(0), BigInt(0)],
    _pB: [
      [BigInt(0), BigInt(0)],
      [BigInt(0), BigInt(0)],
    ],
    _pC: [BigInt(0), BigInt(0)],
    _pubSignals: [BigInt(0), BigInt(0), BigInt(0), BigInt(0)],
  };

export const OWNERSHIP_VERIFIER_WASM_RELATIVE_PATH =
  'ownershipVerifier/wasm/ownershipVerifier_js/ownershipVerifier.wasm';
export const OWNERSHIP_VERIFIER_PROVING_KEY_RELATIVE_PATH =
  'ownershipVerifier/keys/proving_key.zkey';
export const OWNERSHIP_VERIFIER_VERIFICATION_KEY_RELATIVE_PATH =
  'ownershipVerifier/keys/verification_key.json';

export const CREDIT_REGISTER_WASM_RELATIVE_PATH =
  'creditRegister/wasm/creditRegister_js/creditRegister.wasm';
export const CREDIT_REGISTER_PROVING_KEY_RELATIVE_PATH =
  'creditRegister/keys/proving_key.zkey';
export const CREDIT_REGISTER_VERIFICATION_KEY_RELATIVE_PATH =
  'creditRegister/keys/verification_key.json';

export const CREDIT_VERIFIER_WASM_RELATIVE_PATH =
  'creditVerifier/wasm/creditVerifier_js/creditVerifier.wasm';
export const CREDIT_VERIFIER_PROVING_KEY_RELATIVE_PATH =
  'creditVerifier/keys/proving_key.zkey';
export const CREDIT_VERIFIER_VERIFICATION_KEY_RELATIVE_PATH =
  'creditVerifier/keys/verification_key.json';
