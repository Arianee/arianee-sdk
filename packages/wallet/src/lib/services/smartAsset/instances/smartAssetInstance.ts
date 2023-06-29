import { SmartAsset, Event, ChainType } from '@arianee/common-types';
import ArianeeEventInstance from './arianeeEventInstance';
import SmartAssetService from '../smartAsset';
import { ContractTransactionReceipt } from 'ethers';

export default class SmartAssetInstance<T extends ChainType> {
  public readonly data: SmartAsset;
  public readonly arianeeEvents: ArianeeEventInstance<T>[];

  private passphrase?: string;
  private userAddress: string;

  constructor(
    private smartAssetService: SmartAssetService<T>,
    params: { data: SmartAsset; arianeeEvents: Event[]; userAddress: string },
    opts?: { passphrase?: string }
  ) {
    const { data, arianeeEvents, userAddress } = params;

    this.userAddress = userAddress;
    this.data = data;

    this.arianeeEvents = arianeeEvents.map(
      (event) =>
        new ArianeeEventInstance(this.smartAssetService, this.isOwner, event)
    );

    this.passphrase = opts?.passphrase;
  }

  private get protocolName() {
    return this.data.protocol.name;
  }

  private get certificateId() {
    return this.data.certificateId;
  }

  public get isOwner() {
    return this.data.owner?.toLowerCase() === this.userAddress.toLowerCase();
  }

  public async claim(receiver?: string): Promise<ContractTransactionReceipt> {
    if (this.isOwner)
      throw new Error('User is already owner of the smart asset');

    if (!this.passphrase)
      throw new Error(
        `Cannot claim smart asset (${this.certificateId}): passphrase is undefined`
      );

    return this.smartAssetService.claim(
      this.protocolName,
      this.certificateId,
      this.passphrase,
      {
        receiver,
      }
    );
  }

  public async createProofLink(): Promise<string> {
    if (!this.isOwner)
      throw new Error(
        `User needs to be owner of the smart asset (${this.certificateId}) to create a proof link`
      );

    return this.smartAssetService.createLink(
      'proof',
      this.protocolName,
      this.certificateId
    );
  }
  public async createRequestLink(): Promise<string> {
    if (!this.isOwner)
      throw new Error(
        `User needs to be owner of the smart asset (${this.certificateId}) to create a request link`
      );

    return this.smartAssetService.createLink(
      'requestOwnership',
      this.protocolName,
      this.certificateId
    );
  }
}

export { SmartAssetInstance };
