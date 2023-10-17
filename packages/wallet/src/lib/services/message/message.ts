import ArianeeProtocolClient, {
  NonPayableOverrides,
} from '@arianee/arianee-protocol-client';
import { ChainType, Protocol, SmartAsset } from '@arianee/common-types';
import { DecentralizedMessage } from '@arianee/common-types';
import { WalletAbstraction } from '@arianee/wallet-abstraction';
import {
  ContractTransactionReceipt,
  ContractTransactionResponse,
} from 'ethers';

import { getPreferredLanguages, I18NStrategy } from '../../utils/i18n';
import {
  getWalletReward,
  WalletRewards,
} from '../../utils/walletReward/walletReward';
import Wallet, { TransactionStrategy } from '../../wallet';
import EventManager from '../eventManager/eventManager';
import MessageInstance from './instances/messageInstance';

export default class MessageService<
  T extends ChainType,
  S extends TransactionStrategy
> {
  public readonly received: EventManager<T>['messageReceived'];
  public readonly read: EventManager<T>['messageRead'];

  private walletAbstraction: WalletAbstraction;
  private eventManager: EventManager<T>;
  private i18nStrategy: I18NStrategy;
  private arianeeProtocolClient: ArianeeProtocolClient;
  private walletRewards: WalletRewards;
  private wallet: Wallet<T, S>;

  constructor({
    walletAbstraction,
    eventManager,
    i18nStrategy,
    arianeeProtocolClient,
    walletRewards,
    wallet,
  }: {
    walletAbstraction: WalletAbstraction;
    eventManager: EventManager<T>;
    i18nStrategy: I18NStrategy;
    arianeeProtocolClient: ArianeeProtocolClient;
    walletRewards: WalletRewards;
    wallet: Wallet<T, S>;
  }) {
    this.walletAbstraction = walletAbstraction;
    this.eventManager = eventManager;
    this.i18nStrategy = i18nStrategy;
    this.arianeeProtocolClient = arianeeProtocolClient;
    this.walletRewards = walletRewards;
    this.wallet = wallet;

    this.received = this.eventManager.messageReceived;
    this.read = this.eventManager.messageRead;
  }

  /**
   * Return a MessageInstance corresponding to the message with passed id and protocol
   * @param id message's id
   * @param protocolName name of the protocol on which the message was sent
   * @param params additional parameters
   * @returns a message instance
   */
  async get(
    id: DecentralizedMessage['id'],
    protocolName: Protocol['name'],
    params?: {
      i18nStrategy?: I18NStrategy;
    }
  ): Promise<MessageInstance<T, S>> {
    const { i18nStrategy } = params ?? {};

    const preferredLanguages = getPreferredLanguages(
      i18nStrategy ?? this.i18nStrategy
    );

    const message = await this.walletAbstraction.getMessage(id, protocolName, {
      preferredLanguages,
    });

    return new MessageInstance(this, message);
  }

  /**
   * @param params additional parameters
   * @returns all the messages received by the user
   */
  async getReceived(params?: {
    i18nStrategy?: I18NStrategy;
  }): Promise<MessageInstance<T, S>[]> {
    const { i18nStrategy } = params ?? {};

    const preferredLanguages = getPreferredLanguages(
      i18nStrategy ?? this.i18nStrategy
    );

    const messages = await this.walletAbstraction.getReceivedMessages({
      preferredLanguages,
    });

    const messageInstances = messages.map(
      (message) => new MessageInstance(this, message)
    );

    return messageInstances;
  }

  public async readMessage(
    protocolName: Protocol['name'],
    messageId: DecentralizedMessage['id'],
    overrides?: NonPayableOverrides
  ) {
    return this.wallet.transactionWrapper(
      this.arianeeProtocolClient,
      protocolName,
      {
        protocolV1Action: async (v1) => {
          return v1.storeContract.readMessage(
            messageId,
            getWalletReward(protocolName, this.walletRewards),
            overrides ?? {}
          );
        },
        protocolV2Action: async (protocolV2) =>
          protocolV2.messageHubContract.markMessageAsRead(
            protocolV2.protocolDetails.contractAdresses.nft,
            messageId,
            getWalletReward(protocolName, this.walletRewards)
          ),
      }
    ) as Promise<
      S extends 'WAIT_TRANSACTION_RECEIPT'
        ? ContractTransactionReceipt
        : ContractTransactionResponse
    >;
  }

  private async setBlacklist(
    protocolName: Protocol['name'],
    messageSender: DecentralizedMessage['sender'],
    smartAssetId: SmartAsset['certificateId'],
    activate: boolean,
    overrides?: NonPayableOverrides
  ) {
    return this.wallet.transactionWrapper(
      this.arianeeProtocolClient,
      protocolName,
      {
        protocolV1Action: async (v1) => {
          return v1.whitelistContract.addBlacklistedAddress(
            messageSender,
            smartAssetId,
            activate,
            overrides ?? {}
          );
        },
        protocolV2Action: async (protocolV2) => {
          if (activate) {
            return protocolV2.rulesManagerContract.addMsgPerTokenBlacklist(
              protocolV2.protocolDetails.contractAdresses.nft,
              smartAssetId,
              [messageSender]
            );
          } else {
            return protocolV2.rulesManagerContract.removeMsgPerTokenBlacklist(
              protocolV2.protocolDetails.contractAdresses.nft,
              smartAssetId,
              [messageSender]
            );
          }
        },
      }
    ) as Promise<
      S extends 'WAIT_TRANSACTION_RECEIPT'
        ? ContractTransactionReceipt
        : ContractTransactionResponse
    >;
  }

  public async blackListAddress(
    protocolName: Protocol['name'],
    messageSender: DecentralizedMessage['sender'],
    smartAssetId: SmartAsset['certificateId'],
    overrides?: NonPayableOverrides
  ) {
    return this.setBlacklist(
      protocolName,
      messageSender,
      smartAssetId,
      true,
      overrides
    );
  }

  public async unblackListAddress(
    protocolName: Protocol['name'],
    messageSender: DecentralizedMessage['sender'],
    smartAssetId: SmartAsset['certificateId'],
    overrides?: NonPayableOverrides
  ) {
    return this.setBlacklist(
      protocolName,
      messageSender,
      smartAssetId,
      false,
      overrides
    );
  }
}

export { MessageService };
