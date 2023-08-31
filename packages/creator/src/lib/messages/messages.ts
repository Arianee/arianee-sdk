import Creator from '../creator';
import { requiresConnection } from '../decorators/requiresConnection';
import { checkCreditsBalance } from '../helpers/checkCredits/checkCredits';
import { getCreatorIdentity } from '../helpers/identity/getCreatorIdentity';
import { checkCreateMessageParameters } from '../helpers/message/checkCreateMessageParameters';
import { getCreateMessageParams } from '../helpers/message/getCreateMessageParams';
import { ArianeePrivacyGatewayClient } from '@arianee/arianee-privacy-gateway-client';
import {
  CreateAndStoreEventParameters,
  CreateAndStoreMessageParameters,
  CreatedEvent,
  CreatedMessage,
  CreateEventCommonParameters,
  CreateEventParameters,
  CreateMessageCommonParameters,
  CreateMessageParameters,
  CreateSmartAssetCommonParameters,
  CreateSmartAssetParameters,
  CreditType,
  LinkObject,
  TokenAccess,
} from '../types';
import {
  NonPayableOverrides,
  transactionWrapper,
} from '@arianee/arianee-protocol-client';
import { ArianeeMessageI18N } from '@arianee/common-types';
import { ArianeePrivacyGatewayError } from '../errors';
import { getContentFromURI } from '../helpers/uri/getContentFromURI';

export default class Messages {
  constructor(private creator: Creator) {}

  @requiresConnection()
  public async createAndStoreMessage(
    params: CreateAndStoreMessageParameters,
    overrides: NonPayableOverrides = {}
  ): Promise<CreatedMessage> {
    await getCreatorIdentity(this.creator); // assert has identity

    return this.createMessageCommon(
      params,
      async (messageId) => {
        await this.storeMessage(messageId, params.content);
      },
      overrides
    );
  }

  @requiresConnection()
  public async createMessage(
    params: CreateMessageParameters,
    overrides: NonPayableOverrides = {}
  ): Promise<CreatedMessage> {
    const content = await getContentFromURI<ArianeeMessageI18N>(
      params.uri,
      this.creator.fetchLike
    );

    return this.createMessageCommon(
      {
        ...params,
        content,
      },
      null,
      overrides
    );
  }

  @requiresConnection()
  private async createMessageCommon(
    params: CreateMessageCommonParameters,
    afterTransaction:
      | ((
          messageId: NonNullable<CreateMessageCommonParameters['messageId']>
        ) => Promise<void>)
      | null,

    overrides: NonPayableOverrides = {}
  ): Promise<CreatedMessage> {
    const { smartAssetId, messageId, uri } = await getCreateMessageParams(
      this.creator.utils,
      params
    );

    await checkCreateMessageParameters(this.creator, {
      ...params,
      smartAssetId,
      messageId,
      uri,
    });

    await checkCreditsBalance(
      this.creator.utils,
      CreditType.message,
      BigInt(1)
    );

    const imprint = await this.creator.utils.calculateImprint(params.content);

    await transactionWrapper(
      this.creator.arianeeProtocolClient,
      this.creator.slug!,
      {
        protocolV1Action: async (protocolV1) =>
          protocolV1.storeContract.createMessage(
            messageId,
            smartAssetId,
            imprint,
            this.creator.creatorAddress,
            overrides
          ),
      },
      this.creator.connectOptions
    );

    if (afterTransaction) await afterTransaction(messageId);

    return {
      id: messageId,
      imprint,
    };
  }

  @requiresConnection()
  private async storeMessage(
    messageId: number,
    content: CreateAndStoreMessageParameters['content']
  ) {
    const identity = await getCreatorIdentity(this.creator);

    const client = new ArianeePrivacyGatewayClient(
      this.creator.core,
      this.creator.fetchLike
    );

    try {
      await client.messageCreate(identity.rpcEndpoint, {
        messageId: messageId.toString(),
        content,
      });
    } catch (e) {
      throw new ArianeePrivacyGatewayError(
        `Error while storing message on Arianee Privacy Gateway\n${
          e instanceof Error ? e.message : 'unknown reason'
        }`
      );
    }
  }
}
