import { ethers6_v1, ethers6_v1_1 } from '@arianee/arianee-abi';
import { Signer } from 'ethers';

import { ProtocolClientBase } from '../shared/protocolClientBase';
import { ProtocolDetailsV1, ProtocolV1Versions } from '../shared/types';
import GasStation from '../utils/gasStation/gasStation';

export default class ProtocolClientV1 extends ProtocolClientBase<ProtocolDetailsV1> {
  public readonly storeContract:
    | ethers6_v1.ArianeeStore
    | ethers6_v1_1.ArianeeStore;

  public readonly identityContract:
    | ethers6_v1.ArianeeIdentity
    | ethers6_v1_1.ArianeeIdentity;

  public readonly smartAssetContract:
    | ethers6_v1.ArianeeSmartAsset
    | ethers6_v1_1.ArianeeSmartAsset;

  public readonly ariaContract: ethers6_v1.Aria | ethers6_v1_1.Aria;

  public readonly creditHistoryContract:
    | ethers6_v1.ArianeeCreditHistory
    | ethers6_v1_1.ArianeeCreditHistory;

  public readonly whitelistContract:
    | ethers6_v1.ArianeeWhitelist
    | ethers6_v1_1.ArianeeWhitelist;

  public readonly eventContract:
    | ethers6_v1.ArianeeEvent
    | ethers6_v1_1.ArianeeEvent;

  public readonly messageContract:
    | ethers6_v1.ArianeeMessage
    | ethers6_v1_1.ArianeeMessage;

  public readonly userActionContract:
    | ethers6_v1.ArianeeUserAction
    | ethers6_v1_1.ArianeeUserAction;

  public readonly updateSmartAssetContract:
    | ethers6_v1.ArianeeUpdate
    | ethers6_v1_1.ArianeeUpdate;

  constructor(
    signer: Signer,
    protocolDetails: ProtocolDetailsV1,
    gasStation: GasStation
  ) {
    super(signer, protocolDetails, gasStation);

    const { protocolVersion } = protocolDetails;

    // use a record enforce exhaustive check
    const versions1: Record<ProtocolV1Versions, null> = {
      '1': null,
      '1.1': null,
      '1.0': null,
      '1.5': null,
    };

    if (!Object.keys(versions1).includes(protocolVersion))
      throw new Error(
        'ProtocolClientV1 is not compatible with protocol v' + protocolVersion
      );

    const ethers6 =
      protocolVersion === '1' || protocolVersion === '1.0'
        ? ethers6_v1
        : ethers6_v1_1;

    this.storeContract = ethers6.ArianeeStore__factory.connect(
      this.protocolDetails.contractAdresses.store,
      this.signer
    );

    this.identityContract = ethers6.ArianeeIdentity__factory.connect(
      this.protocolDetails.contractAdresses.identity,
      this.signer
    );

    this.smartAssetContract = ethers6.ArianeeSmartAsset__factory.connect(
      this.protocolDetails.contractAdresses.smartAsset,
      this.signer
    );

    this.ariaContract = ethers6.Aria__factory.connect(
      this.protocolDetails.contractAdresses.aria,
      this.signer
    );

    this.creditHistoryContract = ethers6.ArianeeCreditHistory__factory.connect(
      this.protocolDetails.contractAdresses.creditHistory,
      this.signer
    );

    this.whitelistContract = ethers6.ArianeeWhitelist__factory.connect(
      this.protocolDetails.contractAdresses.whitelist,
      this.signer
    );

    this.eventContract = ethers6.ArianeeEvent__factory.connect(
      this.protocolDetails.contractAdresses.eventArianee,
      this.signer
    );

    this.messageContract = ethers6.ArianeeMessage__factory.connect(
      this.protocolDetails.contractAdresses.message,
      this.signer
    );

    this.userActionContract = ethers6.ArianeeUserAction__factory.connect(
      this.protocolDetails.contractAdresses.userAction ??
        '0x0000000000000000000000000000000000000000',
      this.signer
    );

    this.updateSmartAssetContract = ethers6.ArianeeUpdate__factory.connect(
      this.protocolDetails.contractAdresses.updateSmartAssets,
      this.signer
    );
  }
}

export { ProtocolClientV1 };
