/* eslint-disable @typescript-eslint/no-non-null-assertion */
import Core from '@arianee/core';
import { defaultFetchLike } from '@arianee/utils';
import ArianeeProtocolClient, {
  NonPayableOverrides,
  callWrapper,
  transactionWrapper,
} from '@arianee/arianee-protocol-client';
import { CreditType } from './types/credit';

export type CreatorParams = {
  creatorAddress: string;
  core: Core;
  fetchLike?: typeof fetch;
};

export default class Creator {
  public readonly core: Core;
  private creatorAddress: string;
  private fetchLike: typeof fetch;

  private arianeeProtocolClient: ArianeeProtocolClient;

  private slug: string | null = null;
  private connectOptions?: Parameters<ArianeeProtocolClient['connect']>[1];

  constructor(params: CreatorParams) {
    const { fetchLike, core, creatorAddress } = params;

    this.core = core;
    this.creatorAddress = creatorAddress;
    this.fetchLike = fetchLike ?? defaultFetchLike;

    this.arianeeProtocolClient = new ArianeeProtocolClient(this.core, {
      fetchLike: this.fetchLike,
    });
  }

  public async connect(
    slug: string,
    options?: { httpProvider: string }
  ): Promise<boolean> {
    try {
      await this.arianeeProtocolClient.connect(slug, options);
      this.slug = slug;
      this.connectOptions = options;
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

  public async getAvailableSmartAssetId(): Promise<number> {
    this.requiresCreatorToBeConnected();

    let idCandidate: number;
    let isFree = false;

    do {
      idCandidate = Math.ceil(Math.random() * 1000000000);
      isFree = await this.isSmartAssetIdAvailable(idCandidate);
    } while (!isFree);

    return idCandidate;
  }

  private async isSmartAssetIdAvailable(id: number): Promise<boolean> {
    this.requiresCreatorToBeConnected();

    let isFree = false;

    await callWrapper(
      this.arianeeProtocolClient,
      this.slug!,
      {
        protocolV1Action: async (protocolV1) => {
          // NFTs assigned to zero address are considered invalid, and queries about them do throw
          // See https://raw.githubusercontent.com/0xcert/framework/master/packages/0xcert-ethereum-erc721-contracts/src/contracts/nf-token-metadata-enumerable.sol
          try {
            await protocolV1.smartAssetContract.ownerOf(id);
          } catch {
            isFree = true;
          }

          return '';
        },
      },
      this.connectOptions
    );

    return isFree;
  }

  public async reserveSmartAssetId(
    id?: number,
    overrides: NonPayableOverrides = {}
  ) {
    this.requiresCreatorToBeConnected();

    if (id) {
      const isFree = await this.isSmartAssetIdAvailable(id);
      if (!isFree) {
        throw new Error(`The id ${id} is not available`);
      }
    }

    const smartAssetCredits = await this.getCreditBalance(
      CreditType.smartAsset
    );
    if (smartAssetCredits === BigInt(0))
      throw new Error(
        `You do not have enough smart asset credits to reserve a smart asset ID (required: 1, balance: ${smartAssetCredits})`
      );

    const _id = id ?? (await this.getAvailableSmartAssetId());

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

  private requiresCreatorToBeConnected(): void {
    if (!this.connected || !this.slug)
      throw new Error(
        'Creator is not connected, you must call the connect method once before calling other methods'
      );
  }

  private async getSmartAssetOwner(id: string): Promise<string> {
    return callWrapper(
      this.arianeeProtocolClient,
      this.slug!,
      {
        protocolV1Action: async (protocolV1) =>
          await protocolV1.smartAssetContract.ownerOf(id),
      },
      this.connectOptions
    );
  }

  public async getCreditBalance(creditType: CreditType): Promise<bigint> {
    return callWrapper(
      this.arianeeProtocolClient,
      this.slug!,
      {
        protocolV1Action: async (protocolV1) =>
          await protocolV1.creditHistoryContract.balanceOf(
            this.core.getAddress(),
            creditType
          ),
      },
      this.connectOptions
    );
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
    const smartAssetOwner = await this.getSmartAssetOwner(id);

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
