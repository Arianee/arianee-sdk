import { ProtocolV2NftInterface } from '@arianee/common-types';
import { CheckV2NftInterfaceError } from '../../../errors';
import ProtocolClientV2 from '../../protocolClientV2';

/**
 * Checks that the target interface is satisfying `need` on the nft contract of the protocol client.
 * If the `need` is not satisfied and `throwIfNeedNotSatisfied` is true, throws a `CheckV2NftInterfaceError`.
 * @param nftInterface the interface to check
 * @param protocolClientV2 the protocol client to check against
 * @param need the need to satisfy ('Implemented' or 'NotImplemented')
 * @param throwIfNeedNotSatisfied whether to throw if the need is not satisfied
 */
export const checkV2NftInterface = ({
  nftInterface,
  protocolClientV2,
  need,
  throwIfNeedNotSatisfied = true,
}: {
  nftInterface: ProtocolV2NftInterface;
  protocolClientV2: ProtocolClientV2;
  need: 'Implemented' | 'NotImplemented';
  throwIfNeedNotSatisfied?: boolean;
}): boolean => {
  if (!('nftInterfaces' in protocolClientV2.protocolDetails))
    throw new Error(
      'Malformed protocol details: nftInterfaces must be defined'
    );

  const isInterfaceImplemented =
    protocolClientV2.protocolDetails.nftInterfaces[nftInterface];
  const isNeedSatisfied =
    need === 'Implemented' ? isInterfaceImplemented : !isInterfaceImplemented;
  if (throwIfNeedNotSatisfied && !isNeedSatisfied) {
    throw new CheckV2NftInterfaceError(
      `Interface "${nftInterface}" is ${
        need === 'Implemented' ? 'not ' : ''
      }implemented on the nft contract of this protocol`
    );
  }

  return isNeedSatisfied;
};
