export type Protocol = { name: string; chainId: number };
export type ChainType = 'mainnet' | 'testnet';

export type ProtocolDetails = ProtocolDetailsV1 | ProtocolDetailsV2;

export type ProtocolDetailsBase = {
  protocolVersion: ProtocolVersion;
  chainId: number;
  httpProvider: string;
  gasStation: string;
};

export type ProtocolVersion = ProtocolV1Versions | ProtocolV2Versions;
export type ProtocolV1Versions = '1' | '1.0' | '1.1' | '1.5';
export type ProtocolV2Versions = '2.0';

export interface ProtocolDetailsV1 extends ProtocolDetailsBase {
  protocolVersion: ProtocolV1Versions;
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
}

export interface ProtocolDetailsV2 extends ProtocolDetailsBase {
  protocolVersion: ProtocolV2Versions;
  contractAdresses: {
    nft: string;
    ownershipRegistry: string;
    eventHub: string;
    messageHub: string;
    rulesManager: string;
    creditManager: string;
  };
  nftInterfaces: Record<ProtocolV2NftInterface, boolean>;
}

export type ProtocolV2NftInterface =
  | 'ERC721'
  | 'SmartAsset'
  | 'SmartAssetBurnable'
  | 'SmartAssetRecoverable'
  | 'SmartAssetSoulbound'
  | 'SmartAssetUpdatable'
  | 'SmartAssetURIStorage'
  | 'SmartAssetURIStorageOverridable';

export type ProtocolDetailsResolver = (
  slug: string
) => Promise<ProtocolDetails>;
