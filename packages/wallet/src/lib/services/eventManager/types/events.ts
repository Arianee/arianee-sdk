import {
  BrandIdentity,
  DecentralizedMessage,
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
  messageReceived: MessageReceivedEvent;
  messageRead: MessageReadEvent;
};

export type SmartAssetReceivedEvent = {
  certificateId: SmartAsset['certificateId'];
  protocol: Protocol;
  from: string;
};

export type SmartAssetTransferedEvent = {
  certificateId: SmartAsset['certificateId'];
  protocol: Protocol;
  to: string;
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

export type MessageReceivedEvent = {
  messageId: DecentralizedMessage['id'];
  protocol: Protocol;
};

export type MessageReadEvent = {
  messageId: DecentralizedMessage['id'];
  protocol: Protocol;
};
