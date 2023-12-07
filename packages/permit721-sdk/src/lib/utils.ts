import { PermitTransferFrom as PermitTransferFromV5 } from './signatureTransfer';
import { TypedDataDomain as TypedDataDomainV5 } from '@ethersproject/abstract-signer';
import { TypedDataDomain as TypedDataDomainV6 } from 'ethers';

/**
 * Converts an expiration (in milliseconds) to a deadline (in seconds) suitable for the EVM.
 * Permit721 expresses expirations as deadlines, but JavaScript usually uses milliseconds,
 * so this is provided as a convenience function.
 */
export function toDeadline(expiration: number): number {
  return Math.floor((Date.now() + expiration) / 1000);
}

/**
 * Converts a TypedDataDomainV5 to a TypedDataDomainV6.
 * Utility function to convert a data domain from ethers v5 to v6.
 */
export function tddAdapter(tdd: TypedDataDomainV5): TypedDataDomainV6 {
  return {
    name: tdd.name,
    version: tdd.version,
    chainId: tdd.chainId?.toString(),
    verifyingContract: tdd.verifyingContract,
    salt: tdd.salt?.toString(),
  };
}

/**
 * Converts a PermitTransferFromV5 to a PermitTransferFromV6.
 * Utility function to convert a permit transferFrom from ethers v5 to v6.
 */
export function ptfAdapter(ptf: PermitTransferFromV5): any {
  return {
    permitted: {
      token: ptf.permitted.token,
      tokenId: ptf.permitted.tokenId?.toString(),
    },
    nonce: ptf.nonce?.toString(),
    deadline: ptf.deadline?.toString(),
  };
}
