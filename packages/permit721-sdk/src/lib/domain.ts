import {
  TypedDataDomain,
  TypedDataField,
} from '@ethersproject/abstract-signer';

const PERMIT721_DOMAIN_NAME = 'Permit721';

export function permit721Domain(
  permit721Address: string,
  chainId: number
): TypedDataDomain {
  return {
    name: PERMIT721_DOMAIN_NAME,
    chainId,
    verifyingContract: permit721Address,
  };
}

export type PermitData = {
  domain: TypedDataDomain;
  types: Record<string, TypedDataField[]>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  values: any;
};
