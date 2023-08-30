export type ProtocolDetails = ProtocolDetailsV1 | ProtocolDetailsV2;

export type ProtocolDetailsBase = {
  protocolVersion: ProtocolVersion;
};

export type ProtocolVersion = ProtocolV1Versions | ProtocolV2Versions;
export type ProtocolV1Versions = '1' | '1.0' | '1.1';
export type ProtocolV2Versions = '2';

export interface ProtocolDetailsV1 extends ProtocolDetailsBase {
  contractAdresses: {
    smartAsset: string;
    identity: string;
    aria: string;
    store: string;
    creditHistory: string;
    whitelist: string;
    eventArianee: string;
    message: string;
    userAction: string;
    updateSmartAssets: string;
  };
  httpProvider: string;
  gasStation: string;
  chainId: number;
  protocolVersion: ProtocolV1Versions;
}

export interface ProtocolDetailsV2 extends ProtocolDetailsBase {
  chainId: number;
  httpProvider: string;
  gasStation: string;
  contractAdresses: {
    nft: string;
    ownership: string;
    rulesManager: string;
    event: string;
    message: string;
    credit: string;
  };
  collectionFeatures: Record<ProtocolV2Feature, boolean>;
  protocolVersion: ProtocolV2Versions;
}

export enum ProtocolV2Feature {
  burnable = 'burnable',
  recoverable = 'recoverable',
  uriUpdatable = 'uriUpdatable',
  imprintUpdatable = 'imprintUpdatable',
  transferable = 'transferable',
}
