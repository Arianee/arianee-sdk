/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { callWrapper } from '@arianee/arianee-protocol-client';
import { ArianeeBrandIdentityI18N } from '@arianee/common-types';

import Creator, { TransactionStrategy } from '../../creator';
import { MalformedIdentityError, NoIdentityError } from '../../errors';

export type IdentityWithRpcEndpoint = ArianeeBrandIdentityI18N & {
  rpcEndpoint: NonNullable<ArianeeBrandIdentityI18N['rpcEndpoint']>;
};

export const getCreatorIdentity = async <Strategy extends TransactionStrategy>(
  creator: Creator<Strategy>
): Promise<IdentityWithRpcEndpoint> => {
  return getIdentity(creator, creator.core.getAddress());
};

export const getIdentity = async <Strategy extends TransactionStrategy>(
  creator: Creator<Strategy>,
  address: string
): Promise<IdentityWithRpcEndpoint> => {
  const identityURI = await callWrapper(
    creator.arianeeProtocolClient,
    creator.slug!,
    {
      protocolV1Action: async (protocolV1) =>
        await protocolV1.identityContract.addressURI(address),
      protocolV2Action: async (protocolV2) => {
        throw new Error('not yet implemented');
      },
    },
    creator.connectOptions
  );

  if (identityURI === '')
    throw new NoIdentityError(
      `The address ${address} has no identity URI, it needs to be a valid identity to store content`
    );

  const req = await creator.fetchLike(identityURI);
  const identity: ArianeeBrandIdentityI18N = await req.json();

  if (!identity.rpcEndpoint)
    throw new MalformedIdentityError('The identity has no rpcEndpoint');

  return identity as ArianeeBrandIdentityI18N & {
    rpcEndpoint: NonNullable<ArianeeBrandIdentityI18N['rpcEndpoint']>;
  };
};
