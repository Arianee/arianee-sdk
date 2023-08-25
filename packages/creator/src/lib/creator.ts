/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { ArianeePrivacyGatewayClient } from '@arianee/arianee-privacy-gateway-client';
import ArianeeProtocolClient, {
  NonPayableOverrides,
  transactionWrapper,
} from '@arianee/arianee-protocol-client';
import { ProtocolDetails } from '@arianee/arianee-protocol-client';
import {
  ArianeeEventI18N,
  ArianeeMessageI18N,
  ArianeeProductCertificateI18N,
  SmartAsset,
} from '@arianee/common-types';
import { TokenAccessType } from '@arianee/common-types';
import Core from '@arianee/core';
import { defaultFetchLike, getHostnameFromProtocolName } from '@arianee/utils';

import { requiresConnection } from './decorators/requiresConnection';
import {
  InvalidURIError,
  NotOwnerError,
  UnavailableSmartAssetIdError,
} from './errors';
import { checkCreditsBalance } from './helpers/checkCredits/checkCredits';
import { checkCreateEventParameters } from './helpers/event/checkCreateEventParameters';
import { getCreateEventParams } from './helpers/event/getCreateEventParams';
import { getTokenAccessParams } from './helpers/getTokenAccessParams/getTokenAccessParams';
import { getCreatorIdentity } from './helpers/identity/getCreatorIdentity';
import { checkCreateMessageParameters } from './helpers/message/checkCreateMessageParameters';
import { getCreateMessageParams } from './helpers/message/getCreateMessageParams';
import { checkCreateSmartAssetParameters } from './helpers/smartAsset/checkCreateSmartAssetParameters';
import { getCreateSmartAssetParams } from './helpers/smartAsset/getCreateSmartAssetParams';
import {
  CreateAndStoreEventParameters,
  CreateAndStoreMessageParameters,
  CreateAndStoreSmartAssetParameters,
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
} from './types';
import Utils from './utils/utils';

export type CreatorParams = {
  creatorAddress: string;
  core: Core;
  fetchLike?: typeof fetch;
};

export default class Creator {
  public readonly core: Core;
  public readonly creatorAddress: string;
  public readonly fetchLike: typeof fetch;

  public readonly arianeeProtocolClient: ArianeeProtocolClient;

  private _slug: string | null = null;
  private _connectOptions?: Parameters<ArianeeProtocolClient['connect']>[1];
  private _protocolDetails: ProtocolDetails | null = null;

  public get slug(): string | null {
    return this._slug;
  }

  public get connectOptions():
    | Parameters<ArianeeProtocolClient['connect']>[1]
    | undefined {
    return this._connectOptions;
  }

  public get protocolDetails(): ProtocolDetails | null {
    return this._protocolDetails;
  }

  public readonly utils: Utils;

  constructor(params: CreatorParams) {
    const { fetchLike, core, creatorAddress } = params;

    this.core = core;
    this.creatorAddress = creatorAddress;
    this.fetchLike = fetchLike ?? defaultFetchLike;

    this.arianeeProtocolClient = new ArianeeProtocolClient(this.core, {
      fetchLike: this.fetchLike,
    });

    this.utils = new Utils(this);
  }

  public async connect(
    slug: string,
    options?: { httpProvider: string }
  ): Promise<boolean> {
    try {
      const protocol = await this.arianeeProtocolClient.connect(slug, options);
      this._slug = slug;
      this._connectOptions = options;

      if ('v1' in protocol) {
        this._protocolDetails = protocol.v1.protocolDetails;
      }
    } catch (error) {
      console.error(error);
      throw new Error(
        `Unable to connect to protocol ${slug}, see error above for more details`
      );
    }

    return this.connected;
  }

  public get connected(): boolean {
    return !!this.slug;
  }

  @requiresConnection()
  public async reserveSmartAssetId(
    id?: number,
    overrides: NonPayableOverrides = {}
  ) {
    if (id) {
      const isFree = await this.utils.isSmartAssetIdAvailable(id);
      if (!isFree) {
        throw new UnavailableSmartAssetIdError(`The id ${id} is not available`);
      }
    }

    await checkCreditsBalance(this.utils, CreditType.smartAsset, BigInt(1));

    const _id = id ?? (await this.utils.getAvailableSmartAssetId());

    return transactionWrapper(
      this.arianeeProtocolClient,
      this.slug!,
      {
        protocolV1Action: async (protocolV1) =>
          protocolV1.storeContract.reserveToken(
            _id,
            this.core.getAddress(),
            overrides
          ),
      },
      this.connectOptions
    );
  }

  private createLinkObject(
    smartAssetId: number | string,
    passphrase?: string
  ): LinkObject {
    const deeplink = passphrase
      ? `https://${getHostnameFromProtocolName(
          this.slug!
        )}/${smartAssetId},${passphrase}`
      : undefined;

    return {
      deeplink,
      smartAssetId: smartAssetId.toString(),
      passphrase,
    };
  }

  @requiresConnection()
  private async storeSmartAsset(
    smartAssetId: number,
    content: CreateAndStoreSmartAssetParameters['content']
  ) {
    const identity = await getCreatorIdentity(this);

    const client = new ArianeePrivacyGatewayClient(this.core, this.fetchLike);
    await client.certificateCreate(identity.rpcEndpoint, {
      certificateId: smartAssetId.toString(),
      content,
    });
  }

  @requiresConnection()
  public async createAndStoreSmartAsset(
    params: CreateAndStoreSmartAssetParameters,
    overrides: NonPayableOverrides = {}
  ): Promise<LinkObject> {
    await getCreatorIdentity(this); // assert has identity

    return this.createSmartAssetCommon(
      params,
      async (smartAssetId) => {
        await this.storeSmartAsset(smartAssetId, params.content);
      },
      overrides
    );
  }

  @requiresConnection()
  public async createSmartAsset(
    params: CreateSmartAssetParameters,
    overrides: NonPayableOverrides = {}
  ): Promise<LinkObject> {
    let content: ArianeeProductCertificateI18N;

    try {
      const res = await this.fetchLike(params.uri);
      if (!res.ok) throw new Error('Response not ok');

      content = await res.json();
    } catch {
      throw new InvalidURIError('Invalid URI: could not fetch the URI content');
    }

    return this.createSmartAssetCommon(
      {
        ...params,
        content,
      },
      null,
      overrides
    );
  }

  @requiresConnection()
  private async createSmartAssetCommon(
    params: CreateSmartAssetCommonParameters,
    afterTransaction:
      | ((
          smartAssetId: NonNullable<
            CreateSmartAssetCommonParameters['smartAssetId']
          >
        ) => Promise<void>)
      | null,
    overrides: NonPayableOverrides = {}
  ): Promise<LinkObject> {
    const {
      smartAssetId,
      initialKeyIsRequestKey,
      passphrase,
      publicKey,
      tokenRecoveryTimestamp,
      uri,
    } = await getCreateSmartAssetParams(this.utils, params);

    await checkCreateSmartAssetParameters(this.utils, {
      ...params,
      smartAssetId,
    });

    await checkCreditsBalance(this.utils, CreditType.smartAsset, BigInt(1));

    const imprint = await this.utils.calculateImprint(params.content);

    await transactionWrapper(
      this.arianeeProtocolClient,
      this.slug!,
      {
        protocolV1Action: async (protocolV1) =>
          protocolV1.storeContract.hydrateToken(
            smartAssetId,
            imprint,
            uri,
            publicKey,
            tokenRecoveryTimestamp,
            initialKeyIsRequestKey,
            this.creatorAddress,
            overrides
          ),
      },
      this.connectOptions
    );

    if (afterTransaction) await afterTransaction(smartAssetId);

    return this.createLinkObject(smartAssetId, passphrase);
  }

  @requiresConnection()
  private async storeMessage(
    messageId: number,
    content: CreateAndStoreMessageParameters['content']
  ) {
    const identity = await getCreatorIdentity(this);

    const client = new ArianeePrivacyGatewayClient(this.core, this.fetchLike);
    await client.messageCreate(identity.rpcEndpoint, {
      messageId: messageId.toString(),
      content,
    });
  }

  @requiresConnection()
  public async createAndStoreMessage(
    params: CreateAndStoreMessageParameters,
    overrides: NonPayableOverrides = {}
  ): Promise<CreatedMessage> {
    await getCreatorIdentity(this); // assert has identity

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
    let content: ArianeeMessageI18N;
    try {
      const res = await this.fetchLike(params.uri);
      if (!res.ok) throw new Error('Response not ok');

      content = await res.json();
    } catch {
      throw new InvalidURIError('Invalid URI: could not fetch the URI content');
    }

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
      this.utils,
      params
    );

    await checkCreateMessageParameters(this, {
      ...params,
      smartAssetId,
      messageId,
      uri,
    });

    await checkCreditsBalance(this.utils, CreditType.message, BigInt(1));

    const imprint = await this.utils.calculateImprint(params.content);

    await transactionWrapper(
      this.arianeeProtocolClient,
      this.slug!,
      {
        protocolV1Action: async (protocolV1) =>
          protocolV1.storeContract.createMessage(
            messageId,
            smartAssetId,
            imprint,
            this.creatorAddress,
            overrides
          ),
      },
      this.connectOptions
    );

    if (afterTransaction) await afterTransaction(messageId);

    return {
      id: messageId,
      imprint,
    };
  }

  @requiresConnection()
  private async storeEvent(
    eventId: number,
    content: CreateAndStoreEventParameters['content']
  ) {
    const identity = await getCreatorIdentity(this);

    const client = new ArianeePrivacyGatewayClient(this.core, this.fetchLike);
    await client.eventCreate(identity.rpcEndpoint, {
      eventId: eventId.toString(),
      content,
    });
  }

  @requiresConnection()
  public async createAndStoreEvent(
    params: CreateAndStoreEventParameters,
    overrides: NonPayableOverrides = {}
  ): Promise<CreatedEvent> {
    await getCreatorIdentity(this); // assert has identity

    return this.createEventCommon(
      params,
      async (eventId) => {
        await this.storeEvent(eventId, params.content);
      },
      overrides
    );
  }

  @requiresConnection()
  public async createEvent(
    params: CreateEventParameters,
    overrides: NonPayableOverrides = {}
  ): Promise<CreatedEvent> {
    let content: ArianeeEventI18N;
    try {
      const res = await this.fetchLike(params.uri);
      if (!res.ok) throw new Error('Response not ok');

      content = await res.json();
    } catch {
      throw new InvalidURIError('Invalid URI: could not fetch the URI content');
    }

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
  private async createEventCommon(
    params: CreateEventCommonParameters,
    afterTransaction:
      | ((
          eventId: NonNullable<CreateEventCommonParameters['eventId']>
        ) => Promise<void>)
      | null,

    overrides: NonPayableOverrides = {}
  ): Promise<CreatedMessage> {
    const { smartAssetId, eventId, uri } = await getCreateEventParams(
      this.utils,
      params
    );

    await checkCreateEventParameters(this, {
      ...params,
      smartAssetId,
      eventId,
      uri,
    });

    await checkCreditsBalance(this.utils, CreditType.event, BigInt(1));

    const imprint = await this.utils.calculateImprint(params.content);

    await transactionWrapper(
      this.arianeeProtocolClient,
      this.slug!,
      {
        protocolV1Action: async (protocolV1) =>
          protocolV1.storeContract.createEvent(
            eventId,
            smartAssetId,
            imprint,
            uri,
            this.creatorAddress,
            overrides
          ),
      },
      this.connectOptions
    );

    if (afterTransaction) await afterTransaction(eventId);

    return {
      id: eventId,
      imprint,
    };
  }

  @requiresConnection()
  public async buyCredit(
    creditType: CreditType,
    amount: number,
    overrides: NonPayableOverrides = {}
  ) {
    const storeAllowance = await this.utils.getAriaAllowance(
      this._protocolDetails!.contractAdresses.store,
      this.core.getAddress()
    );

    const requiredAria =
      (await this.utils.getCreditPrice(creditType)) * BigInt(amount);

    if (storeAllowance < requiredAria) {
      await this.utils.approveAriaSpender(
        this._protocolDetails!.contractAdresses.store,
        requiredAria * BigInt(100)
      );
    }

    return transactionWrapper(this.arianeeProtocolClient, this.slug!, {
      protocolV1Action: async (protocolV1) =>
        protocolV1.storeContract.buyCredit(
          creditType,
          amount,
          this.core.getAddress(),
          overrides
        ),
    });
  }

  @requiresConnection()
  public async recoverSmartAsset(
    id: string,
    overrides: NonPayableOverrides = {}
  ) {
    const smartAssetIssuer = await this.utils.getSmartAssetIssuer(id);

    if (smartAssetIssuer !== this.core.getAddress())
      throw new Error('You are not the issuer of this smart asset');

    return transactionWrapper(
      this.arianeeProtocolClient,
      this.slug!,
      {
        protocolV1Action: async (protocolV1) =>
          protocolV1.smartAssetContract.recoverTokenToIssuer(id, overrides),
      },
      this.connectOptions
    );
  }

  @requiresConnection()
  public async destroySmartAsset(
    id: string,
    overrides: NonPayableOverrides = {}
  ) {
    const smartAssetOwner = await this.utils.getSmartAssetOwner(id);

    if (smartAssetOwner !== this.core.getAddress())
      throw new NotOwnerError('You are not the owner of this smart asset');

    return transactionWrapper(
      this.arianeeProtocolClient,
      this.slug!,
      {
        protocolV1Action: async (protocolV1) =>
          protocolV1.smartAssetContract.transferFrom(
            this.core.getAddress(),
            '0x000000000000000000000000000000000000dead',
            id,
            overrides
          ),
      },
      this.connectOptions
    );
  }

  @requiresConnection()
  public async setTokenAccess(
    smartAssetId: SmartAsset['certificateId'],
    tokenAccessType: TokenAccessType,
    tokenAccess?: TokenAccess,
    overrides: NonPayableOverrides = {}
  ): Promise<LinkObject> {
    const owner = await this.utils.getSmartAssetOwner(smartAssetId);

    if (owner !== this.core.getAddress())
      throw new NotOwnerError('You are not the owner of this smart asset');

    const { publicKey, passphrase } = getTokenAccessParams(tokenAccess);

    await transactionWrapper(
      this.arianeeProtocolClient,
      this.slug!,
      {
        protocolV1Action: async (protocolV1) =>
          protocolV1.smartAssetContract.addTokenAccess(
            smartAssetId,
            publicKey,
            true,
            tokenAccessType,
            overrides
          ),
      },
      this.connectOptions
    );

    return this.createLinkObject(smartAssetId, passphrase);
  }

  @requiresConnection()
  public async setRequestKey(
    smartAssetId: SmartAsset['certificateId'],
    tokenAccess?: TokenAccess,
    overrides: NonPayableOverrides = {}
  ): Promise<LinkObject> {
    return this.setTokenAccess(
      smartAssetId,
      TokenAccessType.request,
      tokenAccess,
      overrides
    );
  }
}

export { Creator };
