import { ChainType, SmartAsset } from '@arianee/common-types';

import { TransactionStrategy } from '../../../wallet';
import SmartAssetService from '../smartAsset';
import ArianeeEventInstance from './arianeeEventInstance';

export default class SmartAssetInstance<
  T extends ChainType,
  S extends TransactionStrategy = 'WAIT_TRANSACTION_RECEIPT'
> {
  public readonly data: SmartAsset;
  public readonly arianeeEvents: ArianeeEventInstance<T, S>[];

  readonly passphrase?: string;

  constructor(
    private smartAssetService: SmartAssetService<T, S>,
    params: {
      data: SmartAsset;
      arianeeEvents: ArianeeEventInstance<T, S>[];
    },
    opts?: { passphrase?: string }
  ) {
    const { data, arianeeEvents } = params;

    this.data = data;

    this.arianeeEvents = arianeeEvents;

    this.passphrase = opts?.passphrase;
  }

  private get protocolName() {
    return this.data.protocol.name;
  }

  private get certificateId() {
    return this.data.certificateId;
  }

  public get isOwner() {
    return this.smartAssetService.isOwnerOf(this.data);
  }

  public async claim(receiver?: string) {
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

  public async transfer(receiver: string) {
    if (!this.isOwner)
      throw new Error(
        `User needs to be owner of the smart asset (${this.certificateId}) to transfer it`
      );

    return this.smartAssetService.transfer(
      this.protocolName,
      this.certificateId,
      receiver
    );
  }

  public async createArianeeAccessToken() {
    if (!this.isOwner)
      throw new Error(
        `User needs to be owner of the smart asset (${this.certificateId}) to create a proof link`
      );

    return this.smartAssetService.createCertificateArianeeAccessToken(
      this.certificateId,
      this.protocolName
    );
  }
}

export { SmartAssetInstance };
