import { ChainType, Protocol } from '@arianee/common-types';
import { WalletAbstraction } from '@arianee/wallet-abstraction';
import { I18NStrategy, getPreferredLanguages } from '../../utils/i18n';
import EventManager from '../eventManager/eventManager';
import { DecentralizedMessage } from '@arianee/common-types';

export type MessageInstance = {
  data: DecentralizedMessage;
};

export default class MessageService<T extends ChainType> {
  public readonly received: EventManager<T>['messageReceived'];
  public readonly read: EventManager<T>['messageRead'];

  constructor(
    private walletAbstraction: WalletAbstraction,
    private eventManager: EventManager<T>,
    private i18nStrategy: I18NStrategy
  ) {
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
    }));

    return messageInstances;
  }
}

export { MessageService };
