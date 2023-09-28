import {
  CreditManager,
  CreditManager__factory,
  EventHub,
  EventHub__factory,
  MessageHub,
  MessageHub__factory,
  OwnershipRegistry,
  OwnershipRegistry__factory,
  RulesManager,
  RulesManager__factory,
  SmartAssetBase,
  SmartAssetBase__factory,
  SmartAssetBurnable,
  SmartAssetBurnable__factory,
  SmartAssetRecoverable,
  SmartAssetRecoverable__factory,
  SmartAssetSoulbound,
  SmartAssetSoulbound__factory,
  SmartAssetUpdatable,
  SmartAssetUpdatable__factory,
  SmartAssetURIStorage,
  SmartAssetURIStorage__factory,
  SmartAssetURIStorageOverridable,
  SmartAssetURIStorageOverridable__factory,
} from '@arianee/contracts';
import { Signer } from 'ethers';

import { ProtocolClientBase } from '../shared/protocolClientBase';
import GasStation from '../utils/gasStation/gasStation';
import { ProtocolDetailsV2, ProtocolV2Versions } from '@arianee/common-types';

export default class ProtocolClientV2 extends ProtocolClientBase<ProtocolDetailsV2> {
  public readonly creditManagerContract: CreditManager;
  public readonly eventHubContract: EventHub;
  public readonly messageHubContract: MessageHub;
  public readonly rulesManagerContract: RulesManager;
  public readonly smartAssetBaseContract: SmartAssetBase;
  public readonly smartAssetBurnableContract: SmartAssetBurnable;
  public readonly smartAssetRecoverableContract: SmartAssetRecoverable;
  public readonly smartAssetSoulboundContract: SmartAssetSoulbound;
  public readonly smartAssetUpdatableContract: SmartAssetUpdatable;
  public readonly smartAssetURIStorageContract: SmartAssetURIStorage;
  public readonly smartAssetURIStorageOverridableContract: SmartAssetURIStorageOverridable;
  public readonly ownershipRegistryContract: OwnershipRegistry;

  constructor(
    signer: Signer,
    protocolDetails: ProtocolDetailsV2,
    gasStation: GasStation
  ) {
    super(signer, protocolDetails, gasStation);

    this.checkVersion();

    this.creditManagerContract = CreditManager__factory.connect(
      this.protocolDetails.contractAdresses.creditManager,
      this.signer
    );

    this.eventHubContract = EventHub__factory.connect(
      this.protocolDetails.contractAdresses.eventHub,
      this.signer
    );

    this.messageHubContract = MessageHub__factory.connect(
      this.protocolDetails.contractAdresses.messageHub,
      this.signer
    );

    this.rulesManagerContract = RulesManager__factory.connect(
      this.protocolDetails.contractAdresses.rulesManager,
      this.signer
    );

    this.smartAssetBaseContract = SmartAssetBase__factory.connect(
      this.protocolDetails.contractAdresses.nft,
      this.signer
    );

    this.smartAssetBurnableContract = SmartAssetBurnable__factory.connect(
      this.protocolDetails.contractAdresses.nft,
      this.signer
    );

    this.smartAssetRecoverableContract = SmartAssetRecoverable__factory.connect(
      this.protocolDetails.contractAdresses.nft,
      this.signer
    );

    this.smartAssetSoulboundContract = SmartAssetSoulbound__factory.connect(
      this.protocolDetails.contractAdresses.nft,
      this.signer
    );

    this.smartAssetUpdatableContract = SmartAssetUpdatable__factory.connect(
      this.protocolDetails.contractAdresses.nft,
      this.signer
    );

    this.smartAssetURIStorageContract = SmartAssetURIStorage__factory.connect(
      this.protocolDetails.contractAdresses.nft,
      this.signer
    );

    this.smartAssetURIStorageOverridableContract =
      SmartAssetURIStorageOverridable__factory.connect(
        this.protocolDetails.contractAdresses.nft,
        this.signer
      );

    this.ownershipRegistryContract = OwnershipRegistry__factory.connect(
      this.protocolDetails.contractAdresses.nft,
      this.signer
    );
  }

  private checkVersion() {
    const { protocolVersion } = this.protocolDetails;

    // use a record enforce exhaustive check
    const versions2: Record<ProtocolV2Versions, null> = {
      '2.0': null,
    };

    if (!Object.keys(versions2).includes(protocolVersion))
      throw new Error(
        'ProtocolClientV2 is not compatible with protocol v' + protocolVersion
      );
  }
}

export { ProtocolClientV2 };
