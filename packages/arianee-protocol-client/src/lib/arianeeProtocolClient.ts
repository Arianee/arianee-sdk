import Core from '@arianee/core';
import ProtocolClientV1 from './v1/protocolClientV1';
import { ProtocolDetails } from './shared/types';
import { ethersWalletFromCore } from './utils/ethersCustom/ethersCustom';
import GasStation from './utils/gasStation/gasStation';

export default class ArianeeProtocolClient {
  private fetchLike: typeof fetch;

  constructor(
    private core: Core,
    options?: {
      fetchLike?: typeof fetch;
    }
  ) {
    if (typeof window === 'undefined') {
      this.fetchLike = options?.fetchLike ?? require('node-fetch');
    } else {
      this.fetchLike = options?.fetchLike ?? window.fetch.bind(window);
    }
  }

  public async connect(
    slug: string,
    options?: { httpProvider: string }
  ): Promise<{ v1: ProtocolClientV1 } | { v2: undefined }> {
    const protocolDetails = await this.getProtocolDetailsFromSlug(slug);
    const httpProvider = options?.httpProvider ?? protocolDetails.httpProvider;

    const wallet = ethersWalletFromCore({
      core: this.core,
      httpProvider,
      chainId: protocolDetails.chainId,
      gasStation: new GasStation(protocolDetails.gasStation, this.fetchLike),
    });

    return {
      v1: new ProtocolClientV1(wallet, {
        ...protocolDetails,
        httpProvider,
      }),
    };
  }

  private async getProtocolDetailsFromSlug(
    slug: string
  ): Promise<ProtocolDetails> {
    const response = await this.fetchLike(
      `https://cert.arianee.org/contractAddresses/${slug}.json`
    );

    if (!response.ok) {
      throw new Error(`No protocol with slug ${slug} found`);
    }

    return response.json();
  }
}

export { ArianeeProtocolClient };
