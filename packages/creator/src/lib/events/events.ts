import { ArianeeApiClient } from '@arianee/arianee-api-client';
import { ArianeePrivacyGatewayClient } from '@arianee/arianee-privacy-gateway-client';
import {
  callWrapper,
  NonPayableOverrides,
} from '@arianee/arianee-protocol-client';
import { ArianeeEventI18N } from '@arianee/common-types';
import { DEFAULT_CREDIT_PROOF } from '@arianee/privacy-circuits';
import {
  ContractTransactionReceipt,
  ContractTransactionResponse,
  ethers,
} from 'ethers';

import Creator, { TransactionStrategy } from '../creator';
import { requiresConnection } from '../decorators/requiresConnection';
import { ArianeePrivacyGatewayError } from '../errors';
import { checkCreditsBalance } from '../helpers/checkCredits/checkCredits';
import { checkCreateEventParameters } from '../helpers/event/checkCreateEventParameters';
import { getCreateEventParams } from '../helpers/event/getCreateEventParams';
import {
  getCreatorIdentity,
  getIdentity,
  IdentityWithRpcEndpoint,
} from '../helpers/identity/getIdentity';
import { getOwnershipProofStruct } from '../helpers/privacy/getOwnershipProofStruct';
import { getContentFromURI } from '../helpers/uri/getContentFromURI';
import {
  CreateAndStoreEventParameters,
  CreatedEvent,
  CreateEventCommonParameters,
  CreateEventParameters,
  CreateEventParametersBase,
  CreditType,
} from '../types';

export default class Events<Strategy extends TransactionStrategy> {
  constructor(private creator: Creator<Strategy>) {}

  @requiresConnection()
  public async createAndStoreEvent(
    params: CreateAndStoreEventParameters,
    overrides: NonPayableOverrides = {}
  ): Promise<CreatedEvent> {
    return this.createEventCommon(
      params,
      async (smartAssetId, eventId) => {
        await this.storeEvent(
          smartAssetId,
          eventId,
          params.content,
          params.useSmartAssetIssuerPrivacyGateway
        );
      },
      overrides
    );
  }

  @requiresConnection()
  private async storeEvent(
    smartAssetId: number,
    eventId: number,
    content: CreateAndStoreEventParameters['content'],
    useSmartAssetIssuerPrivacyGateway = true
  ) {
    let identity: IdentityWithRpcEndpoint;

    if (useSmartAssetIssuerPrivacyGateway) {
      const issuer = await callWrapper(
        this.creator.arianeeProtocolClient,
        this.creator.slug!,
        {
          protocolV1Action: (protocolV1) =>
            protocolV1.smartAssetContract.issuerOf(smartAssetId),
          protocolV2Action: async (protocolV2) => {
            throw new Error('not yet implemented');
          },
        },
        this.creator.connectOptions
      );

      // if the issuer address is defined (not the zero address)
      if (issuer !== ethers.ZeroAddress) {
        identity = await getIdentity(this.creator, issuer);
      } else {
        // otherwise, this is likely a reserved nft, we fallback to the owner address to get the identity (which is the same as the issuer)
        const owner = await callWrapper(
          this.creator.arianeeProtocolClient,
          this.creator.slug!,
          {
            protocolV1Action: (protocolV1) =>
              protocolV1.smartAssetContract.ownerOf(smartAssetId),
            protocolV2Action: async (protocolV2) => {
              throw new Error('not yet implemented');
            },
          },
          this.creator.connectOptions
        );

        identity = await getIdentity(this.creator, owner);
      }
    } else {
      identity = await getCreatorIdentity(this.creator);
    }

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

  private isEventAccepted = async (
    eventId: CreateEventParametersBase['eventId']
  ) => {
    const arianeeApiClient = new ArianeeApiClient();
    const event = await arianeeApiClient.network.getArianeeEvent(
      'testnet',
      eventId!.toString()
    );
    return event.accepted;
  };

  @requiresConnection()
  public async destroyEvent(
    eventId: CreateEventParametersBase['eventId'],
    overrides: NonPayableOverrides = {}
  ): Promise<ContractTransactionReceipt | ContractTransactionResponse> {
    if (!eventId) {
      throw new Error('eventId is required');
    }
    const isEventAccepted = await this.isEventAccepted(eventId);

    return this.creator.transactionWrapper(
      this.creator.arianeeProtocolClient,
      this.creator.slug!,
      {
        protocolV1Action: async (v1) => {
          if (!isEventAccepted) {
            return v1.eventContract.refuse(
              eventId,
              this.creator.creatorAddress,
              overrides
            );
          } else {
            return v1.eventContract.destroy(eventId, overrides);
          }
        },
        protocolV2Action: async (protocolV2) => {
          if (!isEventAccepted) {
            return protocolV2.eventHubContract.refuseEvent(
              protocolV2.protocolDetails.contractAdresses.nft,
              eventId
            );
          } else {
            return protocolV2.eventHubContract.destroyEvent(
              protocolV2.protocolDetails.contractAdresses.nft,
              eventId
            );
          }
        },
      }
    );
  }

  @requiresConnection()
  public async acceptEvent(
    eventId: CreateEventParametersBase['eventId'],
    overrides: NonPayableOverrides = {}
  ): Promise<ContractTransactionReceipt | ContractTransactionResponse> {
    if (!eventId) {
      throw new Error('eventId is required');
    }

    return this.creator.transactionWrapper(
      this.creator.arianeeProtocolClient,
      this.creator.slug!,
      {
        protocolV1Action: async (v1) => {
          return v1.eventContract.accept(
            eventId,
            this.creator.creatorAddress,
            overrides
          );
        },
        protocolV2Action: async (protocolV2) => {
          return protocolV2.eventHubContract.acceptEvent(
            protocolV2.protocolDetails.contractAdresses.nft,
            eventId,
            this.creator.creatorAddress
          );
        },
      }
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
          smartAssetId: NonNullable<
            CreateEventCommonParameters['smartAssetId']
          >,
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
          if (!this.creator.privacyMode) {
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
          } else {
            // INFO: If privacy mode is enabled, we create the event through the "ArianeeIssuerProxy" contract

            const fragment = 'createEvent'; // Fragment: createEvent(_ownershipProof, _creditNoteProof, _creditNotePool, _tokenId, _eventId, _imprint, _uri, _interfaceProvider)
            const creditNotePool = ethers.ZeroAddress;
            const _values = [
              creditNotePool,
              smartAssetId,
              eventId,
              imprint,
              uri,
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
            return protocolV1.arianeeIssuerProxy!.createEvent(
              getOwnershipProofStruct(callData),
              DEFAULT_CREDIT_PROOF,
              creditNotePool,
              smartAssetId,
              eventId,
              imprint,
              uri,
              this.creator.creatorAddress
            );
          }
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

    if (afterTransaction) await afterTransaction(smartAssetId, eventId);

    return {
      id: eventId,
      imprint,
    };
  }
}
