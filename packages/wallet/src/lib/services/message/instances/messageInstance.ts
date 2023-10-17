import { ChainType, DecentralizedMessage } from '@arianee/common-types';

import { TransactionStrategy } from '../../../wallet';
import MessageService from '../message';

export default class MessageInstance<
  T extends ChainType,
  S extends TransactionStrategy
> {
  constructor(
    private messageService: MessageService<T, S>,
    public readonly data: DecentralizedMessage
  ) {}

  public async readMessage() {
    return this.messageService.readMessage(
      this.data.protocol.name,
      this.data.id
    );
  }
}

export { MessageInstance };
