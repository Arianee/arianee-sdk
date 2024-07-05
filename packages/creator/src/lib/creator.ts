import ArianeeProtocolClient, {
  NonPayableOverrides,
  noWaitTransactionWrapper,
  ProtocolClientV1,
  ProtocolClientV2,
  ProtocolDetailsResolver,
  transactionWrapper as _transactionWrapper,
} from '@arianee/arianee-protocol-client';
import Core from '@arianee/core';
import { Prover } from '@arianee/privacy-circuits';
import { defaultFetchLike, retryFetchLike } from '@arianee/utils';
import { cachedFetchLike } from '@arianee/utils';
import { ContractTransactionReceipt } from 'ethers';
import { ContractTransactionResponse } from 'ethers/lib.esm';

import { requiresConnection } from './decorators/requiresConnection';
import Events from './events/events';
import Identities from './identities/identities';
import LostAndStolen from './lostAndStolen/lostAndStolen';
import Messages from './messages/messages';
import SmartAssets from './smartAssets/smartAssets';
import { CreditType } from './types';
import Utils from './utils/utils';

export type TransactionStrategy =
  | 'WAIT_TRANSACTION_RECEIPT'
  | 'DO_NOT_WAIT_TRANSACTION_RECEIPT';

export type CreatorParams<T extends TransactionStrategy> = {
  creatorAddress: string;
  core: Core;
  transactionStrategy: T;
  privacyMode?: boolean;
  // INFO: If you want to use the privacy mode, you need to pass a `circuitsBuildPath` that will be forwarded to the Prover
  circuitsBuildPath?: string;
  fetchLike?: typeof fetch;
  protocolDetailsResolver?: ProtocolDetailsResolver;
  arianeeApiUrl?: string;
};

export default class Creator<Strategy extends TransactionStrategy> {
  public readonly core: Core;
  public readonly creatorAddress: string;
  public readonly fetchLike: typeof fetch;

  public readonly arianeeProtocolClient: ArianeeProtocolClient;

  public readonly privacyMode: boolean;
  public readonly prover: Prover | null = null;

  private _slug: string | null = null;
  private _connectedProtocolClient: ProtocolClientV1 | ProtocolClientV2 | null =
    null;
  private _connectOptions?: Parameters<ArianeeProtocolClient['connect']>[1];

  public readonly transactionWrapper:
    | typeof _transactionWrapper
    | typeof noWaitTransactionWrapper;

  private readonly transactionStrategy: Strategy;

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

  public readonly utils: Utils<Strategy>;
  public readonly smartAssets: SmartAssets<Strategy>;
  public readonly messages: Messages<Strategy>;
  public readonly events: Events<Strategy>;
  public readonly identities: Identities<Strategy>;
  public readonly lostAndStolen: LostAndStolen<Strategy>;

  constructor(params: CreatorParams<Strategy>) {
    const { fetchLike, core, creatorAddress, privacyMode, circuitsBuildPath } =
      params;

    this.core = core;
    this.creatorAddress = creatorAddress;

    this.privacyMode = privacyMode ?? false;
    if (this.privacyMode) {
      // We don't use the "ArianeeCreditNotePool" yet
      this.prover = new Prover({
        core,
        circuitsBuildPath: circuitsBuildPath ?? '', // Will throw an error if empty
        useCreditNotePool: false,
      });
    }

    this.fetchLike =
      fetchLike ?? cachedFetchLike(retryFetchLike(defaultFetchLike));

    this.transactionStrategy = params.transactionStrategy;

    this.transactionWrapper =
      this.transactionStrategy === 'WAIT_TRANSACTION_RECEIPT'
        ? _transactionWrapper
        : noWaitTransactionWrapper;

    this.arianeeProtocolClient = new ArianeeProtocolClient(this.core, {
      fetchLike: this.fetchLike,
      protocolDetailsResolver: params.protocolDetailsResolver,
      arianeeApiUrl: params.arianeeApiUrl,
    });

    this.utils = new Utils(this);
    this.smartAssets = new SmartAssets(this);
    this.messages = new Messages(this);
    this.events = new Events(this);
    this.identities = new Identities(this);
    this.lostAndStolen = new LostAndStolen(this);
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

      if (this.privacyMode) await this.prover!.init();
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

  /**
   * Buys credits of type CreditType for the current wallet
   * Warning: this function will approve the store contract to spend ARIA on your behalf
   * and may not work correctly if you passed `DO_NOT_WAIT_TRANSACTION_RECEIPT` as the transaction strategy
   * as the approval transaction will not be waited for
   * @param creditType the type of credit to buy
   * @param amount the amount of credit to buy
   * @param overrides  overrides for the transaction
   * @returns a ContractTransactionResponse or ContractTransactionReceipt based on
   * the transactionWrapper passed to the constructor
   */
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

    return this.transactionWrapper(this.arianeeProtocolClient, this.slug!, {
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
    }) as Promise<
      Strategy extends 'WAIT_TRANSACTION_RECEIPT'
        ? ContractTransactionReceipt
        : ContractTransactionResponse
    >;
  }
}

export { Creator };
