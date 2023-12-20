/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { callWrapper } from '@arianee/arianee-protocol-client';

import Creator, { TransactionStrategy } from '../../creator';

export const isIdentityApproved = async <Strategy extends TransactionStrategy>(
  creator: Creator<Strategy>
): Promise<boolean> => {
  const isIdentityApproved = await callWrapper(
    creator.arianeeProtocolClient,
    creator.slug!,
    {
      protocolV1Action: async (protocolV1) =>
        await protocolV1.identityContract.addressIsApproved(
          creator.core.getAddress()
        ),
      protocolV2Action: async (protocolV2) => {
        throw new Error('not yet implemented');
      },
    },
    creator.connectOptions
  );

  return isIdentityApproved;
};
