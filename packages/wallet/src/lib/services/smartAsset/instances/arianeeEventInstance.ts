import {
  ArianeeEventI18N,
  ChainType,
  Event,
  Protocol,
} from '@arianee/common-types';
import SmartAssetService from '../smartAsset';
import { ContractTransactionReceipt } from 'ethers';

export default class ArianeeEventInstance<T extends ChainType>
  implements Event
{
  public readonly id: string;
  public readonly certificateId: string;
  public readonly pending: boolean;
  public readonly sender: string;
  public readonly timestamp: number;
  public readonly content: ArianeeEventI18N;
  public readonly rawContent: ArianeeEventI18N;
  public readonly imprint: string;
  public readonly protocol: Protocol;

  constructor(
    private smartAssetService: SmartAssetService<T>,
    private isOwner: boolean,
    {
      id,
      certificateId,
      pending,
      sender,
      timestamp,
      content,
      rawContent,
      imprint,
      protocol,
    }: Event
  ) {
    this.id = id;
    this.certificateId = certificateId;
    this.pending = pending;
    this.sender = sender;
    this.timestamp = timestamp;
    this.content = content;
    this.rawContent = rawContent;
    this.imprint = imprint;
    this.protocol = protocol;
  }

  public async acceptEvent(): Promise<ContractTransactionReceipt> {
    if (!this.isOwner)
      throw new Error(
        `User needs to be owner of the smart asset to accept the event (event: ${this.id}, smart asset: ${this.certificateId})`
      );

    return this.smartAssetService.acceptEvent(this.protocol.name, this.id);
  }

  public async refuseEvent(): Promise<ContractTransactionReceipt> {
    if (!this.isOwner)
      throw new Error(
        `User needs to be owner of the smart asset to refuse the event (event: ${this.id}, smart asset: ${this.certificateId})`
      );

    return this.smartAssetService.refuseEvent(this.protocol.name, this.id);
  }
}

export { ArianeeEventInstance };
