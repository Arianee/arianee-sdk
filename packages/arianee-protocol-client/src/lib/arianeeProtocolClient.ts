import Core from '@arianee/core';
import { defaultFetchLike } from '@arianee/utils';

import {
  ProtocolDetails,
  ProtocolDetailsResolver,
  ProtocolDetailsV1,
  ProtocolDetailsV2,
  ProtocolV1Versions,
  ProtocolV2Versions,
} from './shared/types';
import { ethersWalletFromCore } from './utils/ethersCustom/ethersCustom';
import GasStation from './utils/gasStation/gasStation';
import ProtocolClientV1 from './v1/protocolClientV1';
import ProtocolClientV2 from './v2/protocolClientV2';

export default class ArianeeProtocolClient {
  private fetchLike: typeof fetch;
  private protocolDetailsResolver?: (slug: string) => Promise<ProtocolDetails>;

  constructor(
    private core: Core,
    options?: {
      fetchLike?: typeof fetch;
      protocolDetailsResolver?: ProtocolDetailsResolver;
    }
  ) {
    this.fetchLike = options?.fetchLike ?? defaultFetchLike;

    if (options?.protocolDetailsResolver)
      this.protocolDetailsResolver = options.protocolDetailsResolver;
  }

  public async connect(
    slug: string,
    options?: { httpProvider: string }
  ): Promise<ProtocolClientV1 | ProtocolClientV2> {
    let details: ProtocolDetails;
    if (this.protocolDetailsResolver) {
      details = await this.protocolDetailsResolver(slug);
    } else {
      details = await this.getProtocolDetailsFromSlug(slug);
    }

    const httpProvider = options?.httpProvider ?? details.httpProvider;

    const wallet = ethersWalletFromCore({
      core: this.core,
      httpProvider,
      chainId: details.chainId,
      gasStation: new GasStation(details.gasStation, this.fetchLike),
    });

    // use a record for versions1 and versions2 to enforce exhaustive check
    const versions1: Record<ProtocolV1Versions, null> = {
      '1': null,
      '1.1': null,
      '1.0': null,
      '1.5': null,
    };

    const versions2: Record<ProtocolV2Versions, null> = {
      '2': null,
    };

    if (Object.keys(versions1).includes(details.protocolVersion)) {
      return new ProtocolClientV1(wallet, {
        ...(details as ProtocolDetailsV1),
        httpProvider,
      });
    } else if (Object.keys(versions2).includes(details.protocolVersion)) {
      return new ProtocolClientV2(wallet, {
        ...(details as ProtocolDetailsV2),
        httpProvider,
      });
    }

    throw new Error(
      `Unsupported protocol version ${details.protocolVersion} (slug: ${slug})})`
    );
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

    const json = await response.json();

    if (!('protocolVersion' in json)) {
      throw new Error(
        `Invalid protocol details format for slug ${slug}, no protocolVersion key found`
      );
    }

    return json;
  }
}

export { ArianeeProtocolClient };
