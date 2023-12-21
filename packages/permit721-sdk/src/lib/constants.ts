import { BigNumber } from '@ethersproject/bignumber';

export const PERMIT721_ADDRESS = '0x9d6ac3167db03d0b0aee75f5ed90c8b780f93585';

export const MaxUint48 = BigNumber.from('0xffffffffffff');
export const MaxUint160 = BigNumber.from(
  '0xffffffffffffffffffffffffffffffffffffffff'
);
export const MaxUint256 = BigNumber.from(
  '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
);

// alias max types for their usages
// signature transfer types
export const MaxTokenId = MaxUint256;
export const MaxUnorderedNonce = MaxUint256;
export const MaxSigDeadline = MaxUint256;

export const InstantExpiration: BigNumber = BigNumber.from(0);
