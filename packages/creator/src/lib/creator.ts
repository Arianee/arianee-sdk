import ArianeeProtocolClient, {
  NonPayableOverrides,
  ProtocolClientV1,
  ProtocolClientV2,
  ProtocolDetailsResolver,
  transactionWrapper,
} from '@arianee/arianee-protocol-client';
import Core from '@arianee/core';
import { defaultFetchLike } from '@arianee/utils';

import { requiresConnection } from './decorators/requiresConnection';
import Events from './events/events';
import Identities from './identities/identities';
import Messages from './messages/messages';
import SmartAssets from './smartAssets/smartAssets';
import { CreditType } from './types';
import Utils from './utils/utils';

export type CreatorParams = {
  creatorAddress: string;
  core: Core;
  fetchLike?: typeof fetch;
  protocolDetailsResolver?: ProtocolDetailsResolver;
};

export default class Creator {
  public readonly core: Core;
  public readonly creatorAddress: string;
  public readonly fetchLike: typeof fetch;

  public readonly arianeeProtocolClient: ArianeeProtocolClient;

  private _slug: string | null = null;
  private _connectedProtocolClient: ProtocolClientV1 | ProtocolClientV2 | null =
    null;
  private _connectOptions?: Parameters<ArianeeProtocolClient['connect']>[1];

  public get slug(): string | null {
    return this._slug;
  }

  public get connectedProtocolClient():
    | ProtocolClientV1
    | ProtocolClientV2
    | null {
    return this._connectedProtocolClient;
  }

  public get connectOptions():
    | Parameters<ArianeeProtocolClient['connect']>[1]
    | undefined {
    return this._connectOptions;
  }

  public readonly utils: Utils;
  public readonly smartAssets: SmartAssets;
  public readonly messages: Messages;
  public readonly events: Events;
  public readonly identities: Identities;

  constructor(params: CreatorParams) {
    const { fetchLike, core, creatorAddress } = params;

    this.core = core;
    this.creatorAddress = creatorAddress;
    this.fetchLike = fetchLike ?? defaultFetchLike;

    this.arianeeProtocolClient = new ArianeeProtocolClient(this.core, {
      fetchLike: this.fetchLike,
      protocolDetailsResolver: params.protocolDetailsResolver,
    });

    this.utils = new Utils(this);
    this.smartAssets = new SmartAssets(this);
    this.messages = new Messages(this);
    this.events = new Events(this);
    this.identities = new Identities(this);
  }

  public async connect(
    slug: string,
    options?: { httpProvider: string }
  ): Promise<boolean> {
    try {
      const protocol = await this.arianeeProtocolClient.connect(slug, options);
      this._slug = slug;
      this._connectOptions = options;
      this._connectedProtocolClient = protocol;
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
  public async buyCredit(
    creditType: CreditType,
    amount: number,
    overrides: NonPayableOverrides = {}
  ) {
    const storeAllowance = await this.utils.getAriaAllowance(
      'STORE_CONTRACT_ADDRESS',
      this.core.getAddress()
    );

    const requiredAria =
      (await this.utils.getCreditPrice(creditType)) * BigInt(amount);

    if (storeAllowance < requiredAria) {
      await this.utils.approveAriaSpender(
        'STORE_CONTRACT_ADDRESS',
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
      protocolV2Action: async (protocolV2) => {
        throw new Error('not yet implemented');
      },
    });
  }
}

export { Creator };
