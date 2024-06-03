/**
 * Very specific utility functions for `@arianee/privacy-circuits`. Do not move them to `@arianee/utils`.
 */

import { utils } from 'ffjavascript';
import { randomBytes } from 'crypto'; // This will throw if not used in a Node.js environment but that's fine because @arianee/privacy-circuits is intended to be used in Node.js only.

const leBuff2Int = utils.leBuff2int;
const leInt2Buff = utils.leInt2Buff;

export function randomBigInt(size: number): bigint {
  return leBuff2Int(randomBytes(size));
}

export function toHex(
  value: Buffer | bigint | number | string,
  length: number = 32
) {
  if (value instanceof Buffer) {
    return `0x${value.toString('hex')}`;
  } else {
    return `0x${BigInt(value)
      .toString(16)
      .padStart(length * 2, '0')}`;
  }
}

export { leBuff2Int, leInt2Buff };
