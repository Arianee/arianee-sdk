// import { ISignatureTransfer as ISignatureTransferNs } from '@arianee/permit721-contracts';
import { PermitTransferFrom as PermitTransferFromV5 } from '@arianee/permit721-sdk';
import { TypedDataDomain as TypedDataDomainV5 } from '@ethersproject/abstract-signer';
import { Overrides } from 'ethers';
import { TypedDataDomain as TypedDataDomainV6 } from 'ethers';

export function getNetworkOverrides(network: string) {
  const networkOverrides: Overrides & { from?: string } = {};
  switch (network) {
    case 'sokol':
      networkOverrides.maxPriorityFeePerGas = 1000000000;
      break;
  }
  return networkOverrides;
}

export function isLocalNetwork(network: string) {
  return ['hardhat', 'localhost', 'ganache'].includes(network);
}

export function capitalizeFirstChar(word: string) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

/**
 * Converts an expiration (in milliseconds) to a deadline (in seconds) suitable for the EVM.
 * Permit721 expresses expirations as deadlines, but JavaScript usually uses milliseconds,
 * so this is provided as a convenience function.
 */
export function toDeadline(expiration: number): number {
  return Math.floor((Date.now() + expiration) / 1000);
}

export function tddAdapter(tdd: TypedDataDomainV5): TypedDataDomainV6 {
  return {
    name: tdd.name,
    version: tdd.version,
    chainId: tdd.chainId?.toString(),
    verifyingContract: tdd.verifyingContract,
    salt: tdd.salt?.toString(),
  };
}

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
