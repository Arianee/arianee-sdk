/* eslint-disable @typescript-eslint/no-non-null-assertion */
import Core from '@arianee/core';
import {
  defaultFetchLike,
  generateRandomPassphrase,
  getHostnameFromProtocolName,
} from '@arianee/utils';
import ArianeeProtocolClient, {
  NonPayableOverrides,
  callWrapper,
  transactionWrapper,
} from '@arianee/arianee-protocol-client';
import { CreditType } from './types/credit';
import {
  CreateAndStoreSmartAssetParameters,
  CreateSmartAssetParameters,
  CreateSmartAssetParametersBase,
} from './types/hydrateTokenParameters';
import Utils from './utils/utils';
import { ProtocolDetails } from '@arianee/arianee-protocol-client';
import { LinkObject } from './types/linkObject';
import { InsufficientSmartAssetCreditsError } from './errors/InsufficientSmartAssetCreditsError';
import { UnavailableSmartAssetIdError } from './errors/UnavailableSmartAssetIdError';
import { InvalidURIError } from './errors/InvalidURIError';

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

  public async reserveSmartAssetId(
    id?: number,
    overrides: NonPayableOverrides = {}
  ) {
    this.utils.requiresCreatorToBeConnected();

    if (id) {
      const isFree = await this.utils.isSmartAssetIdAvailable(id);
      if (!isFree) {
        throw new UnavailableSmartAssetIdError(`The id ${id} is not available`);
      }
    }

    const smartAssetCredits = await this.utils.getCreditBalance(
      CreditType.smartAsset
    );
    if (smartAssetCredits === BigInt(0))
      throw new InsufficientSmartAssetCreditsError(
        `You do not have enough smart asset credits to reserve a smart asset ID (required: 1, balance: ${smartAssetCredits})`
      );

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

  private async checkCreateSmartAssetParameters(
    params: CreateSmartAssetParametersBase
  ) {
    if (!params.smartAssetId) throw new Error('Smart asset id required');

    const canCreate = await this.utils.canCreateSmartAsset(params.smartAssetId);
    if (!canCreate) {
      throw new UnavailableSmartAssetIdError(
        `You cannot create a smart asset with id ${params.smartAssetId}`
      );
    }
  }

  private async checkSmartAssetCreditBalance() {
    const balance = await this.utils.getCreditBalance(CreditType.smartAsset);
    if (balance === BigInt(0)) {
      throw new InsufficientSmartAssetCreditsError(
        'Insufficient smart asset credits (balance: 0)'
      );
    }
  }

  private async getCreateSmartAssetParams(
    params: CreateSmartAssetParametersBase | CreateSmartAssetParameters
  ) {
    const smartAssetId =
      params.smartAssetId ?? (await this.utils.getAvailableSmartAssetId());

    const tokenRecoveryTimestamp =
      params.tokenRecoveryTimestamp ??
      Math.ceil(
        new Date(
          new Date().getTime() + 60 * 60 * 24 * 365 * 5 * 1000
        ).getTime() / 1000
      );

    const initialKeyIsRequestKey =
      params.sameRequestOwnershipPassphrase ?? true;

    let passphrase =
      params.tokenAccess && 'fromPassphrase' in params.tokenAccess
        ? params.tokenAccess.fromPassphrase
        : undefined;

    let publicKey: string;
    if (!params.tokenAccess) {
      passphrase = generateRandomPassphrase();
      publicKey = Core.fromPassPhrase(passphrase).getAddress();
    } else if ('address' in params.tokenAccess) {
      publicKey = params.tokenAccess.address;
    } else if ('fromPassphrase' in params.tokenAccess) {
      const wallet = Core.fromPassPhrase(params.tokenAccess.fromPassphrase);
      publicKey = wallet.getAddress();
    } else {
      throw new Error('Invalid token access');
    }

    const uri = 'uri' in params && params.uri ? params.uri : '';

    return {
      smartAssetId,
      tokenRecoveryTimestamp,
      initialKeyIsRequestKey,
      publicKey,
      passphrase,
      uri,
    };
  }

  private createLinkObject(
    smartAssetId: number,
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

  public async createAndStoreSmartAsset(
    params: CreateAndStoreSmartAssetParameters,
    overrides: NonPayableOverrides = {}
  ): Promise<LinkObject | void> {
    this.utils.requiresCreatorToBeConnected();

    const {
      smartAssetId,
      initialKeyIsRequestKey,
      passphrase,
      publicKey,
      tokenRecoveryTimestamp,
      uri,
    } = await this.getCreateSmartAssetParams(params);

    await this.checkCreateSmartAssetParameters({
      ...params,
      smartAssetId,
    });

    await this.checkSmartAssetCreditBalance();

    const imprint =
      '0x0000000000000000000000000000000000000000000000000000000000000111'; // todo: calculate imprint from passed content
    // todo: store content in apg

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

    return this.createLinkObject(smartAssetId, passphrase);
  }

  public async createSmartAsset(
    params: CreateSmartAssetParameters,
    overrides: NonPayableOverrides = {}
  ): Promise<LinkObject | void> {
    this.utils.requiresCreatorToBeConnected();

    const {
      smartAssetId,
      initialKeyIsRequestKey,
      passphrase,
      publicKey,
      tokenRecoveryTimestamp,
      uri,
    } = await this.getCreateSmartAssetParams(params);

    await this.checkCreateSmartAssetParameters({
      ...params,
      smartAssetId,
    });

    await this.checkSmartAssetCreditBalance();

    let imprint: string;
    try {
      const req = await this.fetchLike(uri);
      const content = await req.json();
      imprint =
        '0x0000000000000000000000000000000000000000000000000000000000000111'; // todo: calculate imprint from content
    } catch {
      throw new InvalidURIError('Invalid URI: could not fetch the URI content');
    }

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

    return this.createLinkObject(smartAssetId, passphrase);
  }

  public async buyCredit(
    creditType: CreditType,
    amount: number,
    overrides: NonPayableOverrides = {}
  ) {
    this.utils.requiresCreatorToBeConnected();

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

  public async getSmartAssetIssuer(id: string) {
    return callWrapper(
      this.arianeeProtocolClient,
      this.slug!,
      {
        protocolV1Action: async (protocolV1) =>
          await protocolV1.smartAssetContract.issuerOf(id),
      },
      this.connectOptions
    );
  }

  public async recoverSmartAsset(
    id: string,
    overrides: NonPayableOverrides = {}
  ) {
    const smartAssetIssuer = await this.getSmartAssetIssuer(id);

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

  public async destroySmartAsset(
    id: string,
    overrides: NonPayableOverrides = {}
  ) {
    const smartAssetOwner = await this.utils.getSmartAssetOwner(id);

    if (smartAssetOwner !== this.core.getAddress())
      throw new Error('You are not the owner of this smart asset');

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
}

export { Creator };
