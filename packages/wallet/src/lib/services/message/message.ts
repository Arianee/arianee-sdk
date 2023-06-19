import { ChainType, Protocol } from '@arianee/common-types';
import { WalletAbstraction } from '@arianee/wallet-abstraction';
import { I18NStrategy, getPreferredLanguages } from '../../utils/i18n';
import EventManager from '../eventManager/eventManager';
import { DecentralizedMessage } from '@arianee/common-types';
import {
  WalletRewards,
  getWalletReward,
} from '../../utils/walletReward/walletReward';
import ArianeeProtocolClient from '@arianee/arianee-protocol-client';
import { TransactionReceipt } from 'ethers';

export type MessageInstance = {
  data: DecentralizedMessage;
  readMessage: () => Promise<TransactionReceipt>;
};

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
  ): Promise<MessageInstance> {
    const { i18nStrategy } = params ?? {};

    const preferredLanguages = getPreferredLanguages(
      i18nStrategy ?? this.i18nStrategy
    );

    const message = await this.walletAbstraction.getMessage(id, protocolName, {
      preferredLanguages,
    });

    return {
      data: message,
      readMessage: () => this.readMessage(protocolName, id),
    };
  }

  /**
   * @param params additional parameters
   * @returns all the messages received by the user
   */
  async getReceived(params?: {
    i18nStrategy?: I18NStrategy;
  }): Promise<MessageInstance[]> {
    const { i18nStrategy } = params ?? {};

    const preferredLanguages = getPreferredLanguages(
      i18nStrategy ?? this.i18nStrategy
    );

    const messages = await this.walletAbstraction.getReceivedMessages({
      preferredLanguages,
    });

    const messageInstances = messages.map((message) => ({
      data: message,
      readMessage: () => this.readMessage(message.protocol.name, message.id),
    }));

    return messageInstances;
  }

  public async readMessage(
    protocolName: Protocol['name'],
    messageId: DecentralizedMessage['id']
  ) {
    const protocol = await this.arianeeProtocolClient.connect(protocolName);

    if ('v1' in protocol) {
      const tx = await protocol.v1.storeContract.readMessage(
        messageId,
        getWalletReward(protocolName, this.walletRewards)
      );

      const receipt = await tx.wait();

      if (!receipt)
        throw new Error('Could not retrieve the receipt of the transaction');

      return receipt;
    } else {
      throw new Error('This protocol is not yet supported' + protocolName);
    }
  }
}

export { MessageService };
