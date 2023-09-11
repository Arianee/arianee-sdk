import { ArianeePrivacyGatewayClient } from '@arianee/arianee-privacy-gateway-client';
import {
  NonPayableOverrides,
  transactionWrapper,
} from '@arianee/arianee-protocol-client';
import {
  ArianeeProductCertificateI18N,
  SmartAsset,
  TokenAccessType,
} from '@arianee/common-types';
import { getHostnameFromProtocolName } from '@arianee/utils';

import Creator from '../creator';
import { requiresConnection } from '../decorators/requiresConnection';
import {
  ArianeePrivacyGatewayError,
  NotOwnerError,
  UnavailableSmartAssetIdError,
} from '../errors';
import { checkCreditsBalance } from '../helpers/checkCredits/checkCredits';
import { getTokenAccessParams } from '../helpers/getTokenAccessParams/getTokenAccessParams';
import { getCreatorIdentity } from '../helpers/identity/getCreatorIdentity';
import { assertSmartAssetIssuedBy } from '../helpers/smartAsset/assertSmartAssetIssuedBy';
import { checkCreateSmartAssetParameters } from '../helpers/smartAsset/checkCreateSmartAssetParameters';
import { getCreateSmartAssetParams } from '../helpers/smartAsset/getCreateSmartAssetParams';
import { getContentFromURI } from '../helpers/uri/getContentFromURI';
import {
  CreateAndStoreSmartAssetParameters,
  CreateSmartAssetCommonParameters,
  CreateSmartAssetParameters,
  CreditType,
  LinkObject,
  TokenAccess,
} from '../types';

export default class SmartAssets {
  constructor(private creator: Creator) {}

  @requiresConnection()
  public async reserveSmartAssetId(
    id?: number,
    overrides: NonPayableOverrides = {}
  ) {
    if (id) {
      const isFree = await this.creator.utils.isSmartAssetIdAvailable(id);
      if (!isFree) {
        throw new UnavailableSmartAssetIdError(`The id ${id} is not available`);
      }
    }

    const _id = id ?? (await this.creator.utils.getAvailableSmartAssetId());

    return transactionWrapper(
      this.creator.arianeeProtocolClient,
      this.creator.slug!,
      {
        protocolV1Action: async (protocolV1) => {
          await checkCreditsBalance(
            this.creator.utils,
            CreditType.smartAsset,
            BigInt(1)
          );
          return protocolV1.storeContract.reserveToken(
            _id,
            this.creator.core.getAddress(),
            overrides
          );
        },
        protocolV2Action: async (protocolV2) =>
          protocolV2.smartAssetBaseContract.reserveToken(
            this.creator.core.getAddress(),
            _id
          ),
      },
      this.creator.connectOptions
    );
  }

  @requiresConnection()
  public async destroySmartAsset(
    id: string,
    overrides: NonPayableOverrides = {}
  ) {
    const smartAssetOwner = await this.creator.utils.getSmartAssetOwner(id);

    if (smartAssetOwner !== this.creator.core.getAddress())
      throw new NotOwnerError('You are not the owner of this smart asset');

    return transactionWrapper(
      this.creator.arianeeProtocolClient,
      this.creator.slug!,
      {
        protocolV1Action: async (protocolV1) =>
          protocolV1.smartAssetContract.transferFrom(
            this.creator.core.getAddress(),
            '0x000000000000000000000000000000000000dead',
            id,
            overrides
          ),
        protocolV2Action: async (protocolV2) => {
          throw new Error('not yet implemented');
        },
      },
      this.creator.connectOptions
    );
  }

  @requiresConnection()
  public async recoverSmartAsset(
    id: string,
    overrides: NonPayableOverrides = {}
  ) {
    await assertSmartAssetIssuedBy(
      {
        smartAssetId: id,
        expectedIssuer: this.creator.core.getAddress(),
      },
      this.creator.utils
    );

    return transactionWrapper(
      this.creator.arianeeProtocolClient,
      this.creator.slug!,
      {
        protocolV1Action: async (protocolV1) =>
          protocolV1.smartAssetContract.recoverTokenToIssuer(id, overrides),
        protocolV2Action: async (protocolV2) => {
          throw new Error('not yet implemented');
        },
      },
      this.creator.connectOptions
    );
  }

  @requiresConnection()
  public async createSmartAsset(
    params: CreateSmartAssetParameters,
    overrides: NonPayableOverrides = {}
  ): Promise<LinkObject> {
    const content = await getContentFromURI<ArianeeProductCertificateI18N>(
      params.uri,
      this.creator.fetchLike
    );

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
  public async createAndStoreSmartAsset(
    params: CreateAndStoreSmartAssetParameters,
    overrides: NonPayableOverrides = {}
  ): Promise<LinkObject> {
    await getCreatorIdentity(this.creator); // assert has identity

    return this.createSmartAssetCommon(
      params,
      async (smartAssetId) => {
        await this.storeSmartAsset(smartAssetId, params.content);
      },
      overrides
    );
  }

  @requiresConnection()
  public async updateSmartAsset(
    smartAssetId: SmartAsset['certificateId'],
    content: SmartAsset['content'],
    overrides: NonPayableOverrides = {}
  ): Promise<{ imprint: string }> {
    await getCreatorIdentity(this.creator); // assert has identity

    await assertSmartAssetIssuedBy(
      {
        smartAssetId,
        expectedIssuer: this.creator.core.getAddress(),
      },
      this.creator.utils
    );

    const imprint = await this.creator.utils.calculateImprint(content);

    await transactionWrapper(
      this.creator.arianeeProtocolClient,
      this.creator.slug!,
      {
        protocolV1Action: async (protocolV1) => {
          await checkCreditsBalance(
            this.creator.utils,
            CreditType.update,
            BigInt(1)
          );
          return protocolV1.storeContract.updateSmartAsset(
            smartAssetId,
            imprint,
            this.creator.creatorAddress,
            overrides
          );
        },
        protocolV2Action: async (protocolV2) => {
          throw new Error('not yet implemented');
        },
      },
      this.creator.connectOptions
    );

    await this.updateSmartAssetContent(parseInt(smartAssetId), content);

    return {
      imprint,
    };
  }

  @requiresConnection()
  public async setTokenAccess(
    smartAssetId: SmartAsset['certificateId'],
    tokenAccessType: TokenAccessType,
    tokenAccess?: TokenAccess,
    overrides: NonPayableOverrides = {}
  ): Promise<LinkObject> {
    const owner = await this.creator.utils.getSmartAssetOwner(smartAssetId);

    if (owner !== this.creator.core.getAddress())
      throw new NotOwnerError('You are not the owner of this smart asset');

    const { publicKey, passphrase } = getTokenAccessParams(tokenAccess);

    await transactionWrapper(
      this.creator.arianeeProtocolClient,
      this.creator.slug!,
      {
        protocolV1Action: async (protocolV1) =>
          protocolV1.smartAssetContract.addTokenAccess(
            smartAssetId,
            publicKey,
            true,
            tokenAccessType,
            overrides
          ),
        protocolV2Action: async (protocolV2) => {
          throw new Error('not yet implemented');
        },
      },
      this.creator.connectOptions
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

  @requiresConnection()
  public async updateTokenURI(
    smartAssetId: SmartAsset['certificateId'],
    uri: string,
    overrides: NonPayableOverrides = {}
  ): Promise<void> {
    await assertSmartAssetIssuedBy(
      {
        smartAssetId,
        expectedIssuer: this.creator.core.getAddress(),
      },
      this.creator.utils
    );

    await getContentFromURI(uri, this.creator.fetchLike);

    await transactionWrapper(
      this.creator.arianeeProtocolClient,
      this.creator.slug!,
      {
        protocolV1Action: async (protocolV1) =>
          protocolV1.smartAssetContract.updateTokenURI(
            smartAssetId,
            uri,
            overrides
          ),
        protocolV2Action: async (protocolV2) => {
          throw new Error('not yet implemented');
        },
      },
      this.creator.connectOptions
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
    } = await getCreateSmartAssetParams(this.creator.utils, params);

    await checkCreateSmartAssetParameters(this.creator.utils, {
      ...params,
      smartAssetId,
    });

    const imprint = await this.creator.utils.calculateImprint(params.content);

    await transactionWrapper(
      this.creator.arianeeProtocolClient,
      this.creator.slug!,
      {
        protocolV1Action: async (protocolV1) => {
          await checkCreditsBalance(
            this.creator.utils,
            CreditType.smartAsset,
            BigInt(1)
          );
          return protocolV1.storeContract.hydrateToken(
            smartAssetId,
            imprint,
            uri,
            publicKey,
            tokenRecoveryTimestamp,
            initialKeyIsRequestKey,
            this.creator.creatorAddress,
            overrides
          );
        },
        protocolV2Action: async (protocolV2) => {
          throw new Error('not yet implemented');
        },
      },
      this.creator.connectOptions
    );

    if (afterTransaction) await afterTransaction(smartAssetId);

    return this.createLinkObject(smartAssetId, passphrase);
  }

  @requiresConnection()
  private async storeSmartAsset(
    smartAssetId: number,
    content: CreateAndStoreSmartAssetParameters['content']
  ) {
    const identity = await getCreatorIdentity(this.creator);

    const client = new ArianeePrivacyGatewayClient(
      this.creator.core,
      this.creator.fetchLike
    );

    try {
      await client.certificateCreate(identity.rpcEndpoint, {
        certificateId: smartAssetId.toString(),
        content,
      });
    } catch (e) {
      throw new ArianeePrivacyGatewayError(
        `Error while storing smart asset on Arianee Privacy Gateway\n${
          e instanceof Error ? e.message : 'unknown reason'
        }`
      );
    }
  }

  @requiresConnection()
  private async updateSmartAssetContent(
    smartAssetId: number,
    content: SmartAsset['content']
  ) {
    const identity = await getCreatorIdentity(this.creator);

    const client = new ArianeePrivacyGatewayClient(
      this.creator.core,
      this.creator.fetchLike
    );

    try {
      await client.updateCreate(identity.rpcEndpoint, {
        certificateId: smartAssetId.toString(),
        content,
      });
    } catch (e) {
      throw new ArianeePrivacyGatewayError(
        `Error while updating smart asset on Arianee Privacy Gateway\n${
          e instanceof Error ? e.message : 'unknown reason'
        }`
      );
    }
  }

  private createLinkObject(
    smartAssetId: number | string,
    passphrase?: string
  ): LinkObject {
    const deeplink = passphrase
      ? `https://${getHostnameFromProtocolName(
          this.creator.slug!
        )}/${smartAssetId},${passphrase}`
      : undefined;

    return {
      deeplink,
      smartAssetId: smartAssetId.toString(),
      passphrase,
    };
  }
}
