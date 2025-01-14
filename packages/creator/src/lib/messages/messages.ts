import { ArianeePrivacyGatewayClient } from '@arianee/arianee-privacy-gateway-client';
import { NonPayableOverrides } from '@arianee/arianee-protocol-client';
import { ArianeeMessageI18N } from '@arianee/common-types';
import { DEFAULT_CREDIT_PROOF } from '@arianee/privacy-circuits';
import { ethers } from 'ethers';

import Creator, { TransactionStrategy } from '../creator';
import { requiresConnection } from '../decorators/requiresConnection';
import { ArianeePrivacyGatewayError } from '../errors';
import { checkCreditsBalance } from '../helpers/checkCredits/checkCredits';
import { getCreatorIdentity } from '../helpers/identity/getIdentity';
import { checkCreateMessageParameters } from '../helpers/message/checkCreateMessageParameters';
import { getCreateMessageParams } from '../helpers/message/getCreateMessageParams';
import { getOwnershipProofStruct } from '../helpers/privacy/getOwnershipProofStruct';
import { injectIssuerSig__Message } from '../helpers/privacy/injectIssuerSig';
import { getContentFromURI } from '../helpers/uri/getContentFromURI';
import {
  CreateAndStoreMessageParameters,
  CreatedMessage,
  CreateMessageCommonParameters,
  CreateMessageParameters,
  CreditType,
} from '../types';

export default class Messages<Strategy extends TransactionStrategy> {
  constructor(private creator: Creator<Strategy>) {}

  @requiresConnection()
  public async createAndStoreMessage(
    params: CreateAndStoreMessageParameters,
    overrides: NonPayableOverrides = {}
  ): Promise<CreatedMessage> {
    await getCreatorIdentity(this.creator); // assert has identity

    return this.createMessageCommon(
      params,
      async (messageId, content) => {
        await this.storeMessage(messageId, content);
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
  public async createMessageRaw(
    params: CreateMessageCommonParameters,
    overrides: NonPayableOverrides = {}
  ): Promise<CreatedMessage> {
    return this.createMessageCommon(params, null, overrides);
  }

  @requiresConnection()
  private async createMessageCommon(
    params: CreateMessageCommonParameters,
    afterTransaction:
      | ((
          messageId: NonNullable<CreateMessageCommonParameters['messageId']>,
          content: CreateAndStoreMessageParameters['content']
        ) => Promise<void>)
      | null,

    overrides: NonPayableOverrides = {}
  ): Promise<CreatedMessage> {
    const { smartAssetId, messageId, uri } = await getCreateMessageParams(
      this.creator.utils,
      params
    );

    let content = params.content;
    if (this.creator.privacyMode) {
      content = await injectIssuerSig__Message(
        this.creator.core,
        this.creator.connectedProtocolClient!.protocolDetails,
        messageId,
        params.content
      );
    }

    await checkCreateMessageParameters(this.creator, {
      ...params,
      smartAssetId,
      messageId,
      uri,
    });

    const imprint = await this.creator.utils.calculateImprint(content);

    await this.creator.transactionWrapper(
      this.creator.arianeeProtocolClient,
      this.creator.slug!,
      {
        protocolV1Action: async (protocolV1) => {
          if (!this.creator.privacyMode) {
            await checkCreditsBalance(
              this.creator.utils,
              CreditType.message,
              BigInt(1)
            );
            return protocolV1.storeContract.createMessage(
              messageId,
              smartAssetId,
              imprint,
              this.creator.creatorAddress,
              overrides
            );
          } else {
            // INFO: If privacy mode is enabled, we create the message through the "ArianeeIssuerProxy" contract

            const fragment = 'createMessage'; // Fragment: createMessage(_ownershipProof, _creditNoteProof, _creditNotePool, _messageId, _tokenId, _imprint)
            const creditNotePool = ethers.ZeroAddress;
            const _values = [
              creditNotePool,
              messageId,
              smartAssetId,
              imprint,
              this.creator.creatorAddress,
            ];

            const { intentHashAsStr } =
              await this.creator.prover!.issuerProxy.computeIntentHash({
                protocolV1,
                fragment,
                values: _values,
                needsCreditNoteProof: true,
              });

            const { callData } =
              await this.creator.prover!.issuerProxy.generateProof({
                protocolV1,
                tokenId: String(smartAssetId),
                intentHashAsStr,
              });
            return protocolV1.arianeeIssuerProxy!.createMessage(
              getOwnershipProofStruct(callData),
              DEFAULT_CREDIT_PROOF,
              creditNotePool,
              messageId,
              smartAssetId,
              imprint,
              this.creator.creatorAddress
            );
          }
        },
        protocolV2Action: async (protocolV2) => {
          await checkCreditsBalance(
            this.creator.utils,
            CreditType.message,
            BigInt(1),
            protocolV2.protocolDetails.contractAdresses.messageHub
          );
          return protocolV2.messageHubContract.sendMessage(
            protocolV2.protocolDetails.contractAdresses.messageHub,
            smartAssetId,
            messageId,
            imprint,
            this.creator.creatorAddress
          );
        },
      },
      this.creator.connectOptions
    );

    if (afterTransaction) await afterTransaction(messageId, content);

    return {
      id: messageId,
      imprint,
    };
  }

  @requiresConnection()
  public async storeMessage(
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
