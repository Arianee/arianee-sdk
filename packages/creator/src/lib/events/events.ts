import { ArianeePrivacyGatewayClient } from '@arianee/arianee-privacy-gateway-client';
import { NonPayableOverrides } from '@arianee/arianee-protocol-client';
import { ArianeeEventI18N } from '@arianee/common-types';

import Creator, { TransactionStrategy } from '../creator';
import { requiresConnection } from '../decorators/requiresConnection';
import { ArianeePrivacyGatewayError } from '../errors';
import { checkCreditsBalance } from '../helpers/checkCredits/checkCredits';
import { checkCreateEventParameters } from '../helpers/event/checkCreateEventParameters';
import { getCreateEventParams } from '../helpers/event/getCreateEventParams';
import { getCreatorIdentity } from '../helpers/identity/getCreatorIdentity';
import { getContentFromURI } from '../helpers/uri/getContentFromURI';
import {
  CreateAndStoreEventParameters,
  CreatedEvent,
  CreatedMessage,
  CreateEventCommonParameters,
  CreateEventParameters,
  CreditType,
} from '../types';

export default class Events<Strategy extends TransactionStrategy> {
  constructor(private creator: Creator<Strategy>) {}

  @requiresConnection()
  public async createAndStoreEvent(
    params: CreateAndStoreEventParameters,
    overrides: NonPayableOverrides = {}
  ): Promise<CreatedEvent> {
    await getCreatorIdentity(this.creator); // assert has identity

    return this.createEventCommon(
      params,
      async (eventId) => {
        await this.storeEvent(eventId, params.content);
      },
      overrides
    );
  }

  @requiresConnection()
  private async storeEvent(
    eventId: number,
    content: CreateAndStoreEventParameters['content']
  ) {
    const identity = await getCreatorIdentity(this.creator);

    const client = new ArianeePrivacyGatewayClient(
      this.creator.core,
      this.creator.fetchLike
    );

    try {
      await client.eventCreate(identity.rpcEndpoint, {
        eventId: eventId.toString(),
        content,
      });
    } catch (e) {
      throw new ArianeePrivacyGatewayError(
        `Error while storing event on Arianee Privacy Gateway\n${
          e instanceof Error ? e.message : 'unknown reason'
        }`
      );
    }
  }

  @requiresConnection()
  public async createEvent(
    params: CreateEventParameters,
    overrides: NonPayableOverrides = {}
  ): Promise<CreatedEvent> {
    const content = await getContentFromURI<ArianeeEventI18N>(
      params.uri,
      this.creator.fetchLike
    );

    return this.createEventCommon(
      {
        ...params,
        content,
      },
      null,
      overrides
    );
  }

  @requiresConnection()
  public async createEventRaw(
    params: CreateEventCommonParameters,
    overrides: NonPayableOverrides = {}
  ): Promise<CreatedEvent> {
    return this.createEventCommon(params, null, overrides);
  }

  @requiresConnection()
  private async createEventCommon(
    params: CreateEventCommonParameters,
    afterTransaction:
      | ((
          eventId: NonNullable<CreateEventCommonParameters['eventId']>
        ) => Promise<void>)
      | null,

    overrides: NonPayableOverrides = {}
  ): Promise<CreatedEvent> {
    const { smartAssetId, eventId, uri } = await getCreateEventParams(
      this.creator.utils,
      params
    );

    await checkCreateEventParameters(this.creator, {
      ...params,
      smartAssetId,
      eventId,
      uri,
    });

    const imprint = await this.creator.utils.calculateImprint(params.content);

    await this.creator.transactionWrapper(
      this.creator.arianeeProtocolClient,
      this.creator.slug!,
      {
        protocolV1Action: async (protocolV1) => {
          await checkCreditsBalance(
            this.creator.utils,
            CreditType.event,
            BigInt(1)
          );
          return protocolV1.storeContract.createEvent(
            eventId,
            smartAssetId,
            imprint,
            uri,
            this.creator.creatorAddress,
            overrides
          );
        },
        protocolV2Action: async (protocolV2) => {
          await checkCreditsBalance(
            this.creator.utils,
            CreditType.event,
            BigInt(1),
            protocolV2.protocolDetails.contractAdresses.eventHub
          );
          return protocolV2.eventHubContract.createEvent(
            protocolV2.protocolDetails.contractAdresses.nft,
            eventId,
            smartAssetId,
            imprint,
            uri,
            this.creator.creatorAddress
          );
        },
      },
      this.creator.connectOptions
    );

    if (afterTransaction) await afterTransaction(eventId);

    return {
      id: eventId,
      imprint,
    };
  }
}
