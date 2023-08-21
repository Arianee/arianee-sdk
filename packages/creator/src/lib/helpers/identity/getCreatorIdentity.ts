/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { callWrapper } from '@arianee/arianee-protocol-client';
import { ArianeeBrandIdentityI18N } from '@arianee/common-types';

import Creator from '../../creator';
import { MalformedIdentityError, NoIdentityError } from '../../errors';

export const getCreatorIdentity = async (
  creator: Creator
): Promise<
  ArianeeBrandIdentityI18N & {
    rpcEndpoint: NonNullable<ArianeeBrandIdentityI18N['rpcEndpoint']>;
  }
> => {
  const identityURI = await callWrapper(
    creator.arianeeProtocolClient,
    creator.slug!,
    {
      protocolV1Action: async (protocolV1) =>
        await protocolV1.identityContract.addressURI(creator.core.getAddress()),
    },
    creator.connectOptions
  );

  if (identityURI === '')
    throw new NoIdentityError(
      'The creator address has no identity URI, it needs to be a valid identity to store content'
    );

  const req = await creator.fetchLike(identityURI);
  const identity: ArianeeBrandIdentityI18N = await req.json();

  if (!identity.rpcEndpoint)
    throw new MalformedIdentityError('The identity has no rpcEndpoint');

  return identity as ArianeeBrandIdentityI18N & {
    rpcEndpoint: NonNullable<ArianeeBrandIdentityI18N['rpcEndpoint']>;
  };
};
