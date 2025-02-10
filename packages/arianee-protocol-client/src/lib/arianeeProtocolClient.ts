import { ArianeeApiClient } from '@arianee/arianee-api-client';
import {
  GasStation,
  ProtocolDetails,
  ProtocolDetailsV1,
  ProtocolDetailsV2,
  ProtocolV1Versions,
  ProtocolV2Versions,
} from '@arianee/common-types';
import Core from '@arianee/core';
import {
  cachedFetchLike,
  defaultFetchLike,
  ethersWalletFromCore,
  retryFetchLike,
} from '@arianee/utils';

import { ProtocolDetailsResolver } from './shared/types';
import ProtocolClientV1 from './v1/protocolClientV1';
import ProtocolClientV2 from './v2/protocolClientV2';

export interface ArianeeProtocolClientOptions {
  fetchLike?: typeof fetch;
  arianeeApiUrl?: string;
  protocolDetailsResolver?: ProtocolDetailsResolver;
}

export default class ArianeeProtocolClient {
  private fetchLike: typeof fetch;
  private protocolDetailsResolver?: (slug: string) => Promise<ProtocolDetails>;
  private arianeeApiClient: ArianeeApiClient;

  constructor(private core: Core, options?: ArianeeProtocolClientOptions) {
    this.fetchLike =
      options?.fetchLike ??
      cachedFetchLike(retryFetchLike(defaultFetchLike, 3), {
        timeToLive: 5 * 60 * 1000,
      });

    this.arianeeApiClient = new ArianeeApiClient(
      options?.arianeeApiUrl ?? 'https://api.arianee.com',
      this.fetchLike
    );

    if (options?.protocolDetailsResolver) {
      this.protocolDetailsResolver = options.protocolDetailsResolver;
    }
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
    let gasStation: GasStation | undefined = undefined;
    if (details.gasStation && details.gasStation !== '') {
      gasStation = new GasStation(details.gasStation, this.fetchLike);
    }

    const wallet = ethersWalletFromCore({
      core: this.core,
      httpProvider,
      chainId: details.chainId,
      gasStation,
    });

    // use a record for versions1 and versions2 to enforce exhaustive check
    const versions1: Record<ProtocolV1Versions, null> = {
      '1': null,
      '1.0': null,
      '1.1': null,
      '1.5': null,
      '1.6': null,
    };

    const versions2: Record<ProtocolV2Versions, null> = {
      '2.0': null,
    };

    if (Object.keys(versions1).includes(details.protocolVersion)) {
      return new ProtocolClientV1(
        wallet,
        {
          ...(details as ProtocolDetailsV1),
          httpProvider,
        },
        gasStation
      );
    } else if (Object.keys(versions2).includes(details.protocolVersion)) {
      return new ProtocolClientV2(
        wallet,
        {
          ...(details as ProtocolDetailsV2),
          httpProvider,
        },
        gasStation
      );
    }

    throw new Error(
      `Unsupported protocol version ${details.protocolVersion} (slug: ${slug})})`
    );
  }

  private async getProtocolDetailsFromSlug(
    slug: string
  ): Promise<ProtocolDetails> {
    return this.arianeeApiClient.protocol.getProtocolDetails(slug);
  }
}

export { ArianeeProtocolClient };
