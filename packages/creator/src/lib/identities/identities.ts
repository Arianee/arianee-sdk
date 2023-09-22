import { NonPayableOverrides } from '@arianee/arianee-protocol-client';
import {
  ContractTransactionReceipt,
  ContractTransactionResponse,
} from 'ethers';

import Creator, { TransactionStrategy } from '../creator';
import { requiresConnection } from '../decorators/requiresConnection';
import { getCreatorIdentity } from '../helpers/identity/getCreatorIdentity';

export default class Identities<Strategy extends TransactionStrategy> {
  constructor(private creator: Creator<Strategy>) {}

  @requiresConnection()
  public async updateIdentity(
    {
      uri,
      imprint,
    }: {
      uri: string;
      imprint: string;
    },
    overrides: NonPayableOverrides = {}
  ) {
    // assert creator wallet has an identity
    await getCreatorIdentity(this.creator);

    return this.creator.transactionWrapper(
      this.creator.arianeeProtocolClient,
      this.creator.slug!,
      {
        protocolV1Action: async (protocolV1) => {
          return protocolV1.identityContract.updateInformations(
            uri,
            imprint,
            overrides
          );
        },
        protocolV2Action: async (protocolV2) => {
          throw new Error('not yet implemented');
        },
      },
      this.creator.connectOptions
    ) as Promise<
      Strategy extends 'WAIT_TRANSACTION_RECEIPT'
        ? ContractTransactionReceipt
        : ContractTransactionResponse
    >;
  }
}
