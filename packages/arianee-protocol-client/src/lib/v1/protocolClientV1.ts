import { ethers6_v1, ethers6_v1_5, ethers6_v1_6 } from '@arianee/arianee-abi';
import {
  GasStation,
  ProtocolDetailsV1,
  ProtocolV1Versions,
  ProtocolVersion,
} from '@arianee/common-types';
import { Signer } from 'ethers';

import { ProtocolClientBase } from '../shared/protocolClientBase';

export default class ProtocolClientV1 extends ProtocolClientBase<ProtocolDetailsV1> {
  public readonly storeContract:
    | ethers6_v1.ArianeeStore
    | ethers6_v1_5.ArianeeStore
    | ethers6_v1_6.ArianeeStore;

  public readonly identityContract:
    | ethers6_v1.ArianeeIdentity
    | ethers6_v1_5.ArianeeIdentity
    | ethers6_v1_6.ArianeeIdentity;

  public readonly smartAssetContract:
    | ethers6_v1.ArianeeSmartAsset
    | ethers6_v1_5.ArianeeSmartAsset
    | ethers6_v1_6.ArianeeSmartAsset;

  public readonly ariaContract:
    | ethers6_v1.Aria
    | ethers6_v1_5.Aria
    | ethers6_v1_6.Aria;

  public readonly creditHistoryContract:
    | ethers6_v1.ArianeeCreditHistory
    | ethers6_v1_5.ArianeeCreditHistory
    | ethers6_v1_6.ArianeeCreditHistory;

  public readonly whitelistContract:
    | ethers6_v1.ArianeeWhitelist
    | ethers6_v1_5.ArianeeWhitelist
    | ethers6_v1_6.ArianeeWhitelist;

  public readonly eventContract:
    | ethers6_v1.ArianeeEvent
    | ethers6_v1_5.ArianeeEvent
    | ethers6_v1_6.ArianeeEvent;

  public readonly messageContract:
    | ethers6_v1.ArianeeMessage
    | ethers6_v1_5.ArianeeMessage
    | ethers6_v1_6.ArianeeMessage;

  public readonly userActionContract:
    | ethers6_v1.ArianeeUserAction
    | ethers6_v1_5.ArianeeUserAction;

  public readonly updateSmartAssetContract:
    | ethers6_v1.ArianeeUpdate
    | ethers6_v1_5.ArianeeUpdate
    | ethers6_v1_6.ArianeeSmartAssetUpdate;

  public readonly arianeeLost:
    | ethers6_v1.ArianeeLost
    | ethers6_v1_5.ArianeeLost
    | ethers6_v1_6.ArianeeLost;

  public readonly arianeeIssuerProxy?:
    | ethers6_v1_5.ArianeeIssuerProxy
    | ethers6_v1_6.ArianeeIssuerProxy;

  public readonly arianeeCreditNotePool?: ethers6_v1_5.ArianeeCreditNotePool;

  public readonly isPrivacyEnabled;

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
      '1.0': null,
      '1.1': null,
      '1.5': null,
      '1.6': null,
    };

    if (!Object.keys(versions1).includes(protocolVersion))
      throw new Error(
        'ProtocolClientV1 is not compatible with protocol v' + protocolVersion
      );

    const ethers6 = getEthersModuleFromProtocolVersion(protocolVersion);

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

    this.userActionContract = getUserActionFactory(protocolVersion).connect(
      this.protocolDetails.contractAdresses.userAction ||
        '0x0000000000000000000000000000000000000000',
      this.signer
    );

    this.updateSmartAssetContract = getUpdateSmartAssetFactory(
      protocolVersion
    ).connect(
      this.protocolDetails.contractAdresses.updateSmartAssets,
      this.signer
    );

    this.arianeeLost = ethers6.ArianeeLost__factory.connect(
      this.protocolDetails.contractAdresses.lost,
      this.signer
    );

    if (this.protocolDetails.contractAdresses.issuerProxy) {
      this.arianeeIssuerProxy =
        ethers6_v1_5.ArianeeIssuerProxy__factory.connect(
          this.protocolDetails.contractAdresses.issuerProxy,
          this.signer
        );
    }

    if (this.protocolDetails.contractAdresses.creditNotePool) {
      this.arianeeCreditNotePool =
        ethers6_v1_5.ArianeeCreditNotePool__factory.connect(
          this.protocolDetails.contractAdresses.creditNotePool,
          this.signer
        );
    }

    // If issuerProxy is defined, we consider this version of the protocol as privacy enabled
    // The creditNotePool will not be used in the first phase so we don't need to check it
    this.isPrivacyEnabled = this.arianeeIssuerProxy !== undefined;
  }
}

const getEthersModuleFromProtocolVersion = (
  protocolVersion: ProtocolVersion
) => {
  switch (protocolVersion) {
    case '1':
    case '1.0':
      return ethers6_v1;
    case '1.5':
      return ethers6_v1_5;
    case '1.6':
      return ethers6_v1_6;
    default:
      throw new Error('Unsupported protocol version');
  }
};

const getUpdateSmartAssetFactory = (protocolVersion: ProtocolVersion) => {
  switch (protocolVersion) {
    case '1':
    case '1.0':
      return ethers6_v1.ArianeeUpdate__factory;
    case '1.5':
      return ethers6_v1_5.ArianeeUpdate__factory;
    case '1.6':
      return ethers6_v1_6.ArianeeSmartAssetUpdate__factory;
    default:
      throw new Error('Unsupported protocol version');
  }
};

const getUserActionFactory = (protocolVersion: ProtocolVersion) => {
  switch (protocolVersion) {
    case '1':
    case '1.0':
      return ethers6_v1.ArianeeUserAction__factory;
    case '1.5':
    case '1.6':
      return ethers6_v1_5.ArianeeUserAction__factory;
    default:
      throw new Error('Unsupported protocol version');
  }
};

export { ProtocolClientV1 };
