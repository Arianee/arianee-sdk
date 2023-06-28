import { ChainType, Protocol, SmartAsset } from '@arianee/common-types';
import { WalletAbstraction } from '@arianee/wallet-abstraction';
import { I18NStrategy, getPreferredLanguages } from '../../utils/i18n';
import EventManager from '../eventManager/eventManager';
import { DecentralizedMessage } from '@arianee/common-types';
import {
  WalletRewards,
  getWalletReward,
} from '../../utils/walletReward/walletReward';
import ArianeeProtocolClient from '@arianee/arianee-protocol-client';
import { transactionWrapper } from '../../utils/transactions/transactionWrapper';
import MessageInstance from './instances/messageInstance';

export default class MessageService<T extends ChainType> {
  public readonly received: EventManager<T>['messageReceived'];
  public readonly read: EventManager<T>['messageRead'];

  private walletAbstraction: WalletAbstraction;
  private eventManager: EventManager<T>;
  private i18nStrategy: I18NStrategy;
  private arianeeProtocolClient: ArianeeProtocolClient;
  private walletRewards: WalletRewards;

  constructor({
    walletAbstraction,
    eventManager,
    i18nStrategy,
    arianeeProtocolClient,
    walletRewards,
  }: {
    walletAbstraction: WalletAbstraction;
    eventManager: EventManager<T>;
    i18nStrategy: I18NStrategy;
    arianeeProtocolClient: ArianeeProtocolClient;
    walletRewards: WalletRewards;
  }) {
    this.walletAbstraction = walletAbstraction;
    this.eventManager = eventManager;
    this.i18nStrategy = i18nStrategy;
    this.arianeeProtocolClient = arianeeProtocolClient;
    this.walletRewards = walletRewards;

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
  ): Promise<MessageInstance<T>> {
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
  }): Promise<MessageInstance<T>[]> {
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
    messageId: DecentralizedMessage['id']
  ) {
    return transactionWrapper(this.arianeeProtocolClient, protocolName, {
      protocolV1Action: async (v1) => {
        return v1.storeContract.readMessage(
          messageId,
          getWalletReward(protocolName, this.walletRewards)
        );
      },
    });
  }

  private async setBlacklist(
    protocolName: Protocol['name'],
    messageSender: DecentralizedMessage['sender'],
    smartAssetId: SmartAsset['certificateId'],
    activate: boolean
  ) {
    return transactionWrapper(this.arianeeProtocolClient, protocolName, {
      protocolV1Action: async (v1) => {
        return v1.whitelistContract.addBlacklistedAddress(
          messageSender,
          smartAssetId,
          activate
        );
      },
    });
  }

  public async blackListAddress(
    protocolName: Protocol['name'],
    messageSender: DecentralizedMessage['sender'],
    smartAssetId: SmartAsset['certificateId']
  ) {
    return this.setBlacklist(protocolName, messageSender, smartAssetId, true);
  }

  public async unblackListAddress(
    protocolName: Protocol['name'],
    messageSender: DecentralizedMessage['sender'],
    smartAssetId: SmartAsset['certificateId']
  ) {
    return this.setBlacklist(protocolName, messageSender, smartAssetId, false);
  }
}

export { MessageService };
