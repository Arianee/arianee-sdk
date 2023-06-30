import Core from '@arianee/core';
import { defaultFetchLike } from '@arianee/utils';
import ArianeeProtocolClient from '@arianee/arianee-protocol-client';

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
  private protocol: Awaited<
    ReturnType<ArianeeProtocolClient['connect']>
  > | null = null;

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
      this.protocol = await this.arianeeProtocolClient.connect(slug, options);
    } catch (error) {
      console.error(error);
      throw new Error(
        `Unable to connect to protocol ${slug}, see error above for more details`
      );
    }

    return this.connected;
  }

  public get connected(): boolean {
    return !!this.protocol;
  }
}

export { Creator };
