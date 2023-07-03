import Core from '@arianee/core';
import { defaultFetchLike } from '@arianee/utils';
import ArianeeProtocolClient, {
  callWrapper,
} from '@arianee/arianee-protocol-client';

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
    if (!this.connected || !this.slug)
      throw new Error(
        'Creator is not connected, you must call the connect method once before calling other methods'
      );

    let idCandidate: number;
    let isFree = false;

    do {
      idCandidate = Math.ceil(Math.random() * 1000000000);

      await callWrapper(
        this.arianeeProtocolClient,
        this.slug,
        {
          protocolV1Action: async (protocolV1) => {
            // NFTs assigned to zero address are considered invalid, and queries about them do throw
            // See https://raw.githubusercontent.com/0xcert/framework/master/packages/0xcert-ethereum-erc721-contracts/src/contracts/nf-token-metadata-enumerable.sol
            try {
              await protocolV1.smartAssetContract.ownerOf(idCandidate);
            } catch {
              isFree = true;
            }

            return '';
          },
        },
        this.connectOptions
      );
    } while (!isFree);

    return idCandidate;
  }
}

export { Creator };
