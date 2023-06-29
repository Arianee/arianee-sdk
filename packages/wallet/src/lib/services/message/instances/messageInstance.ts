import { DecentralizedMessage, ChainType } from '@arianee/common-types';
import MessageService from '../message';
import { ContractTransactionReceipt } from 'ethers';

export default class MessageInstance<T extends ChainType> {
  constructor(
    private messageService: MessageService<T>,
    public readonly data: DecentralizedMessage
  ) {}

  public async readMessage(): Promise<ContractTransactionReceipt> {
    return this.messageService.readMessage(
      this.data.protocol.name,
      this.data.id
    );
  }
}

export { MessageInstance };
