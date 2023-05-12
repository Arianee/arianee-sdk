import {
  BrandIdentity,
  Event,
  Protocol,
  SmartAsset,
} from '@arianee/common-types';

export type EventMap = {
  smartAssetReceived: SmartAssetReceivedEvent;
  smartAssetTransferred: SmartAssetTransferedEvent;
  smartAssetUpdated: SmartAssetUpdatedEvent;
  arianeeEventReceived: ArianeeEventReceivedEvent;
  identityUpdated: IdentityUpdatedEvent;
};

export type SmartAssetReceivedEvent = {
  certificateId: SmartAsset['certificateId'];
  protocol: Protocol;
};

export type SmartAssetTransferedEvent = {
  certificateId: SmartAsset['certificateId'];
  protocol: Protocol;
};

export type SmartAssetUpdatedEvent = {
  certificateId: SmartAsset['certificateId'];
  protocol: Protocol;
};

export type ArianeeEventReceivedEvent = {
  certificateId: SmartAsset['certificateId'];
  eventId: Event['id'];
  protocol: Protocol;
};

export type IdentityUpdatedEvent = {
  issuer: BrandIdentity['address'];
  protocol: Protocol;
};
